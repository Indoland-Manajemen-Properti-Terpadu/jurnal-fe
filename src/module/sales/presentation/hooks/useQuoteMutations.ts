import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SaleQuote } from '../../domain/saleQuote';
import type { QuoteFormValues } from '../../domain/saleQuoteForm';
import {
  acceptQuote,
  createQuote,
  deleteQuote,
  downloadQuotePdf,
  duplicateQuote,
  rejectQuote,
  resendQuote,
  reviseQuote,
  sendQuote,
  updateQuote,
  voidQuote,
  type SendQuoteResult,
} from '../../infrastructure/saleQuoteApi';
import type { SendDocInput } from '../../infrastructure/saleDocPayloads';
import { downloadBlob } from './downloadBlob';
import { quoteKeys } from './useQuoteQueries';
import { useQuoteNotifier } from './useQuoteNotifier';

/**
 * Every quote mutation refreshes the quote queries whether it worked or not and never runs
 * optimistically; a pending mutation blocks a second submit.
 */
const useRefreshQuotes = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: quoteKeys.all });
};

export const useCreateQuote = () => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  return useMutation({
    mutationFn: (values: QuoteFormValues) => createQuote(values),
    onSuccess: (quote) => notify.success('created', quote.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useUpdateQuote = (id: string) => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  return useMutation({
    mutationFn: (values: QuoteFormValues) => updateQuote(id, values),
    onSuccess: (quote) => notify.success('updated', quote.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

/** The status changes first and the email follows, so a failed email is only a warning. */
const reportSend = (
  notify: ReturnType<typeof useQuoteNotifier>,
  result: SendQuoteResult,
  input: SendDocInput,
  resend: boolean
) => {
  const number = result.quote.transactionNumber;
  const emailFailed = input.emails.length > 0 && !result.emailSent;
  if (emailFailed) {
    if (!resend) notify.success('sent', number);
    notify.warning(result.emailError ? 'emailNotSentReason' : 'emailNotSent', result.emailError);
    return;
  }
  if (resend) notify.success('resent', number);
  else notify.success(input.emails.length ? 'sentEmail' : 'sent', number);
};

export const useSendQuote = () => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SendDocInput }) => sendQuote(id, input),
    onSuccess: (result, { input }) => reportSend(notify, result, input, false),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useResendQuote = () => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SendDocInput }) => resendQuote(id, input),
    onSuccess: (result, { input }) => reportSend(notify, result, input, true),
    onError: notify.failure,
    onSettled: refresh,
  });
};

/** One hook for the simple status changes: accept, revise, duplicate. */
const useQuoteTransition = (run: (id: string) => Promise<SaleQuote>, successKey: string) => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  return useMutation({
    mutationFn: (id: string) => run(id),
    onSuccess: (quote) => notify.success(successKey, quote.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useAcceptQuote = () => useQuoteTransition(acceptQuote, 'accepted');
export const useReviseQuote = () => useQuoteTransition(reviseQuote, 'revised');
export const useDuplicateQuote = () => useQuoteTransition(duplicateQuote, 'duplicated');

const useQuoteWithReason = (
  run: (id: string, reason: string) => Promise<SaleQuote>,
  successKey: string
) => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => run(id, reason),
    onSuccess: (quote) => notify.success(successKey, quote.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useRejectQuote = () => useQuoteWithReason(rejectQuote, 'rejected');
export const useCancelQuote = () => useQuoteWithReason(voidQuote, 'cancelled');

export const useDeleteQuote = () => {
  const notify = useQuoteNotifier();
  const refresh = useRefreshQuotes();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteQuote(id),
    onSuccess: (_, id) => {
      // A page still open on the deleted draft must not fetch it again.
      queryClient.removeQueries({ queryKey: quoteKeys.detail(id) });
      notify.success('deleted');
    },
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useDownloadQuotePdf = () => {
  const notify = useQuoteNotifier();
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) =>
      downloadBlob(await downloadQuotePdf(id), filename),
    onError: notify.failure,
  });
};
