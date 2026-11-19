import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { SaleOrder } from '../../domain/saleOrder';
import type { OrderFormValues } from '../../domain/saleOrderForm';
import {
  cancelOrder,
  confirmOrder,
  createOrder,
  createOrderFromQuote,
  deleteOrder,
  downloadOrderPdf,
  duplicateOrder,
  resendOrder,
  sendOrder,
  updateOrder,
  type SendOrderResult,
} from '../../infrastructure/saleOrderApi';
import type { SendDocInput } from '../../infrastructure/saleDocPayloads';
import { downloadBlob } from './downloadBlob';
import { useDocNotifier } from './useDocNotifier';
import { orderKeys } from './useOrderQueries';
import { quoteKeys } from './useQuoteQueries';

/**
 * Every order mutation refreshes the order queries, and the quote ones too (an order locks or
 * releases its quote), whether it worked or not. Nothing is optimistic; a pending mutation blocks
 * a second submit.
 */
const useRefreshOrders = () => {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: orderKeys.all }),
      queryClient.invalidateQueries({ queryKey: quoteKeys.all }),
    ]);
};

export const useCreateOrder = () => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: (values: OrderFormValues) => createOrder(values),
    onSuccess: (order) => notify.success('created', order.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useUpdateOrder = (id: string) => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: (values: OrderFormValues) => updateOrder(id, values),
    onSuccess: (order) => notify.success('updated', order.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useCreateOrderFromQuote = () => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: ({ quoteId, targetDate }: { quoteId: string; targetDate?: string }) =>
      createOrderFromQuote(quoteId, targetDate),
    onSuccess: (order) => notify.success('createdFromQuote', order.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

/** One hook for the status changes that need no input: send, confirm, duplicate. */
const useOrderTransition = (run: (id: string) => Promise<SaleOrder>, successKey: string) => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: (id: string) => run(id),
    onSuccess: (order) => notify.success(successKey, order.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

const reportSend = (
  notify: ReturnType<typeof useDocNotifier>,
  result: SendOrderResult,
  input: SendDocInput,
  resend: boolean
) => {
  const number = result.order.transactionNumber;
  const emailFailed = input.emails.length > 0 && !result.emailSent;
  if (emailFailed) {
    if (!resend) notify.success('sent', number);
    const reason = result.emailError;
    if (resend) notify.warning(reason ? 'resendNotSentReason' : 'resendNotSent', reason);
    else notify.warning(reason ? 'emailNotSentReason' : 'emailNotSent', reason);
    return;
  }
  if (resend) notify.success('resent', number);
  else notify.success(input.emails.length ? 'sentEmail' : 'sent', number);
};

export const useSendOrder = () => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SendDocInput }) => sendOrder(id, input),
    onSuccess: (result, { input }) => reportSend(notify, result, input, false),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useResendOrder = () => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SendDocInput }) => resendOrder(id, input),
    onSuccess: (result, { input }) => reportSend(notify, result, input, true),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useDownloadOrderPdf = () => {
  const notify = useDocNotifier('salesOrders');
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) =>
      downloadBlob(await downloadOrderPdf(id), filename),
    onError: notify.failure,
  });
};

export const useConfirmOrder = () => useOrderTransition(confirmOrder, 'confirmed');
export const useDuplicateOrder = () => useOrderTransition(duplicateOrder, 'duplicated');

export const useCancelOrder = () => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => cancelOrder(id, reason),
    onSuccess: (order) => notify.success('cancelled', order.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useDeleteOrder = () => {
  const notify = useDocNotifier('salesOrders');
  const refresh = useRefreshOrders();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: (_, id) => {
      // A page still open on the deleted draft must not fetch it again.
      queryClient.removeQueries({ queryKey: orderKeys.detail(id) });
      notify.success('deleted');
    },
    onError: notify.failure,
    onSettled: refresh,
  });
};
