import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreateSaleFormValues,
  CreateSalePaymentPayload,
  SendSaleResult,
} from '../../domain/sale';
import { buildInvoiceLink } from '../../domain/saleFormat';
import { sendNotices } from '../../domain/saleNotices';
import {
  createSale,
  createSalePayment,
  createSaleTag,
  deleteSale,
  downloadInvoicePdf,
  generateInvoiceLink,
  sendSale,
  updateSale,
  voidSale,
} from '../../infrastructure/saleApi';
import { saleKeys } from './useSaleQueries';
import { useSaleNotifier } from './useSaleNotifier';

/**
 * Every sales mutation refreshes all sales queries whether it worked or not (documents feed the
 * totals and the counts) and never runs optimistically; a pending mutation blocks a second submit.
 */
const useRefreshSales = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: saleKeys.all });
};

export const useCreateSale = () => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  return useMutation({
    mutationFn: ({ values }: { values: CreateSaleFormValues; silent?: boolean }) =>
      createSale(values, 'draft'),
    onSuccess: (result: SendSaleResult, { silent }) => {
      if (!silent) notify.success('draftSaved', result.sale.transactionNumber);
    },
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useUpdateSale = (id: string) => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  return useMutation({
    mutationFn: (values: CreateSaleFormValues) => updateSale(id, values),
    onSuccess: (sale) => notify.success('updated', sale.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

/** Issues a draft, or resends the email of an issued invoice (`resend`). */
export const useSendSale = () => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  return useMutation({
    mutationFn: ({ id, sendEmail }: { id: string; sendEmail: boolean; resend?: boolean }) =>
      sendSale(id, sendEmail),
    onSuccess: (result, { sendEmail, resend }) =>
      notify.notices(
        sendNotices({
          emailRequested: sendEmail,
          emailSent: result.emailSent,
          resend: Boolean(resend),
        }),
        result.sale.transactionNumber
      ),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useVoidSale = () => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) => voidSale(id, reason),
    onSuccess: (sale) => notify.success('voided', sale.transactionNumber),
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useDeleteSale = () => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteSale(id),
    onSuccess: (_, id) => {
      // The deleted invoice must not be fetched again by a page that is still open on it.
      queryClient.removeQueries({ queryKey: saleKeys.detail(id) });
      notify.success('deleted');
    },
    onError: notify.failure,
    onSettled: refresh,
  });
};

export const useCreateSalePayment = () => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  return useMutation({
    mutationFn: (payload: CreateSalePaymentPayload) => createSalePayment(payload),
    onSuccess: (result) =>
      notify.success(result.overpaymentAmount > 0 ? 'paidWithOverpayment' : 'paid'),
    onError: notify.failure,
    onSettled: refresh,
  });
};

/** Adds a tag from a tag field; the new id is returned so the field can select it. */
export const useCreateSaleTag = () => {
  const notify = useSaleNotifier();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (name: string) => createSaleTag(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.tags() });
      notify.success('tagCreated');
    },
    onError: notify.failure,
  });
};

/** Copies the public address of an invoice; the backend returns only the link's token. */
export const useCopyInvoiceLink = () => {
  const notify = useSaleNotifier();
  const refresh = useRefreshSales();
  return useMutation({
    mutationFn: async (id: string) => {
      const token = await generateInvoiceLink(id);
      if (!token) throw new Error('no link');
      const link = buildInvoiceLink(window.location.origin, token);
      await navigator.clipboard.writeText(link);
      return link;
    },
    onSuccess: () => notify.success('linkCopied'),
    onError: () => notify.warning('linkFailed'),
    onSettled: refresh,
  });
};

export const useDownloadInvoicePdf = () => {
  const notify = useSaleNotifier();
  return useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const blob = await downloadInvoicePdf(id);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename || `Faktur-${id}.pdf`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => notify.warning('downloadFailed'),
  });
};
