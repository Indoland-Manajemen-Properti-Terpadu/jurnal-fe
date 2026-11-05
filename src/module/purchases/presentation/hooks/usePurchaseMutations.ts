import { useMutation, useQueryClient } from '@tanstack/react-query';
import type {
  CreditApplicationInput,
  GoodsReceiptInput,
  PaymentVoucherInput,
  PurchaseBillInput,
  PurchaseOrderInput,
  PurchaseRequestInput,
  PurchaseReturnInput,
  QuotationInput,
} from '@/module/purchases/domain/purchaseInputs';
import * as api from '@/module/purchases/infrastructure/purchaseApi';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseNotifier } from '@/module/purchases/presentation/hooks/usePurchaseNotifier';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

/**
 * One purchasing action. Documents feed each other (a receipt changes the order, a payment the
 * bill and the aging report), so any success refreshes every purchasing query; a failure also
 * refreshes, because the refusal often means the document moved on in the meantime.
 * A pending mutation blocks a second submit; amounts are never applied optimistically.
 */
const useAction = <Variables, Result extends { number?: string }>(
  successKey: string,
  run: (variables: Variables) => Promise<Result>,
  onDone?: (result: Result) => void
) => {
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const notify = usePurchaseNotifier();
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
  return useMutation<Result, unknown, Variables>({
    mutationFn: run,
    onSuccess: async (result) => {
      await refresh();
      notify.success(successKey, result?.number);
      onDone?.(result);
    },
    onError: async (error) => {
      notify.failure(error);
      await refresh();
    },
  });
};

type WithId = { id: string };
type WithReason = WithId & { reason: string };
type Doc = { number: string };

/* ---------- Purchase request ---------- */
export const useCreateRequest = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PurchaseRequestInput) => api.createRequest(input), onDone);
export const useUpdateRequest = (onDone?: (doc: WithId & Doc) => void) =>
  useAction(
    'updated',
    ({ id, input }: WithId & { input: PurchaseRequestInput }) => api.updateRequest(id, input),
    onDone
  );
export const useSubmitRequest = () =>
  useAction('submitted', ({ id }: WithId) => api.submitRequest(id));
export const useApproveRequest = () =>
  useAction('approved', ({ id, note }: WithId & { note?: string }) => api.approveRequest(id, note));
export const useRejectRequest = () =>
  useAction('rejected', ({ id, reason }: WithReason) => api.rejectRequest(id, reason));
export const useCancelRequest = () =>
  useAction('cancelled', ({ id, reason }: WithReason) => api.cancelRequest(id, reason));
export const useSaveQuotations = () =>
  useAction('quotationsSaved', ({ id, quotations }: WithId & { quotations: QuotationInput[] }) =>
    api.saveQuotations(id, quotations)
  );
export const useSelectQuotation = () =>
  useAction('vendorSelected', ({ id, quotationId }: WithId & { quotationId: string }) =>
    api.selectQuotation(id, quotationId)
  );

/* ---------- Purchase order ---------- */
export const useCreateOrder = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PurchaseOrderInput) => api.createOrder(input), onDone);
export const useSubmitOrder = () => useAction('submitted', ({ id }: WithId) => api.submitOrder(id));
export const useApproveOrder = () =>
  useAction('approved', ({ id, note }: WithId & { note?: string }) => api.approveOrder(id, note));
export const useRejectOrder = () =>
  useAction('rejected', ({ id, reason }: WithReason) => api.rejectOrder(id, reason));
export const useCloseOrder = () => useAction('closed', ({ id }: WithId) => api.closeOrder(id));
export const useVoidOrder = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidOrder(id, reason));

/* ---------- Goods receipt ---------- */
export const useCreateReceipt = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('received', (input: GoodsReceiptInput) => api.createReceipt(input), onDone);
export const useVoidReceipt = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidReceipt(id, reason));

/* ---------- Bill ---------- */
export const useCreateBill = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PurchaseBillInput) => api.createBill(input), onDone);
export const useVerifyBill = () =>
  useAction('verified', ({ id, acknowledgeVariance }: WithId & { acknowledgeVariance: boolean }) =>
    api.verifyBill(id, acknowledgeVariance)
  );
export const useVoidBill = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidBill(id, reason));
export const useApplyCredit = () =>
  useAction(
    'creditApplied',
    async ({ billId, input }: { billId: string; input: CreditApplicationInput }) => {
      await api.applyCredit(billId, input);
      return {} as { number?: string };
    }
  );
export const useVoidCreditApplication = () =>
  useAction(
    'creditVoided',
    async ({
      billId,
      applicationId,
      reason,
    }: {
      billId: string;
      applicationId: string;
      reason: string;
    }) => {
      await api.voidCreditApplication(billId, applicationId, reason);
      return {} as { number?: string };
    }
  );

/* ---------- Payment voucher ---------- */
export const useCreatePayment = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PaymentVoucherInput) => api.createPayment(input), onDone);
export const useSubmitPayment = () =>
  useAction('submitted', ({ id }: WithId) => api.submitPayment(id));
export const useApprovePayment = () =>
  useAction('approved', ({ id, note }: WithId & { note?: string }) => api.approvePayment(id, note));
export const useRejectPayment = () =>
  useAction('rejected', ({ id, reason }: WithReason) => api.rejectPayment(id, reason));
export const usePayVoucher = () => useAction('paid', ({ id }: WithId) => api.payVoucher(id));
export const useVoidPayment = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidPayment(id, reason));

/* ---------- Return ---------- */
export const useCreateReturn = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PurchaseReturnInput) => api.createReturn(input), onDone);
export const usePostReturn = () => useAction('posted', ({ id }: WithId) => api.postReturn(id));
export const useVoidReturn = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidReturn(id, reason));

/* ---------- Files ---------- */
export const useUploadAttachments = () =>
  useAction(
    'uploaded',
    async ({ target, id, files }: { target: api.AttachmentTarget; id: string; files: File[] }) => {
      await api.uploadAttachments(target, id, files);
      return {} as { number?: string };
    }
  );
