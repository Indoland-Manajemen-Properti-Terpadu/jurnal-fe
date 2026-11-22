import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AttachmentKind } from '@/module/purchases/domain/purchaseCommon';
import type { PayInput, PaymentVoucherInput } from '@/module/purchases/domain/paymentForm';
import type {
  PaymentRequestInput,
  PaymentRequestUpdate,
} from '@/module/purchases/domain/paymentRequest';
import type { RefundInput } from '@/module/purchases/domain/returnForm';
import type { ProcurementInput } from '@/module/purchases/domain/procurement';
import type {
  CreditApplicationInput,
  GoodsReceiptInput,
  OrderDraftInput,
  PurchaseBillInput,
  PurchaseRequestInput,
  PurchaseReturnInput,
  SendOrderInput,
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
  onDone?: (result: Result) => void,
  /** An error the screen answers itself (a question to confirm); no failure message is shown for it. */
  isHandled?: (error: unknown) => boolean
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
      if (!isHandled?.(error)) notify.failure(error);
      await refresh();
    },
  });
};

type WithId = { id: string };
type WithReason = WithId & { reason: string };
type Doc = { number: string };

/* ---------- Purchase request (FPPBJ) ---------- */
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
export const useVerifyRequest = () =>
  useAction('requestVerified', ({ id, note }: WithId & { note?: string }) =>
    api.verifyRequest(id, note)
  );
export const useReturnRequest = () =>
  useAction('requestReturned', ({ id, note }: WithId & { note: string }) =>
    api.returnRequest(id, note)
  );
export const useCancelRequest = () =>
  useAction('cancelled', ({ id, reason }: WithReason) => api.cancelRequest(id, reason));

/* ---------- Procurement ---------- */
export const useSaveProcurement = () =>
  useAction('procurementSaved', ({ id, input }: WithId & { input: ProcurementInput }) =>
    api.saveProcurement(id, input)
  );
export const useSubmitProcurement = () =>
  useAction('procurementSubmitted', ({ id }: WithId) => api.submitProcurement(id));
export const useApproveProcurement = () =>
  useAction('procurementApproved', ({ id, note }: WithId & { note?: string }) =>
    api.approveProcurement(id, note)
  );
export const useRejectProcurement = () =>
  useAction('procurementRejected', ({ id, reason }: WithReason) =>
    api.rejectProcurement(id, reason)
  );
export const useCreateOrdersFromProcurement = () =>
  useAction('ordersCreated', ({ id }: WithId) => api.createOrdersFromProcurement(id));

/* ---------- Purchase order ---------- */
export const useUpdateOrder = (onDone?: (doc: WithId & Doc) => void) =>
  useAction(
    'updated',
    ({ id, input }: WithId & { input: OrderDraftInput }) => api.updateOrder(id, input),
    onDone
  );
export const useSendOrder = () =>
  useAction('orderSent', ({ id, input }: WithId & { input: SendOrderInput }) =>
    api.sendOrder(id, input)
  );
export const useCloseOrder = () =>
  useAction('closed', ({ id, note }: WithId & { note: string }) => api.closeOrder(id, note));
export const useVoidOrder = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidOrder(id, reason));

/* ---------- Goods receipt ---------- */
export const useCreateReceipt = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('received', (input: GoodsReceiptInput) => api.createReceipt(input), onDone);
export const useApproveReceipt = () =>
  useAction('receiptApproved', ({ id, note }: WithId & { note?: string }) =>
    api.approveReceipt(id, note)
  );
export const useRejectReceipt = () =>
  useAction('receiptRejected', ({ id, reason }: WithReason) => api.rejectReceipt(id, reason));
export const useResubmitReceipt = () =>
  useAction('receiptResubmitted', ({ id }: WithId) => api.resubmitReceipt(id));
export const useVoidReceipt = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidReceipt(id, reason));

/* ---------- Bill ---------- */
export const useCreateBill = (
  onDone?: (doc: WithId & Doc) => void,
  isHandled?: (error: unknown) => boolean
) => useAction('created', (input: PurchaseBillInput) => api.createBill(input), onDone, isHandled);
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

/* ---------- Payment Request ---------- */
export const useCreatePaymentRequest = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PaymentRequestInput) => api.createPaymentRequest(input), onDone);
export const useUpdatePaymentRequest = (onDone?: (doc: WithId & Doc) => void) =>
  useAction(
    'updated',
    ({ id, input }: WithId & { input: PaymentRequestUpdate }) =>
      api.updatePaymentRequest(id, input),
    onDone
  );
export const useSubmitPaymentRequest = () =>
  useAction('submitted', ({ id }: WithId) => api.submitPaymentRequest(id));
export const useApprovePaymentRequest = () =>
  useAction('approved', ({ id, note }: WithId & { note?: string }) =>
    api.approvePaymentRequest(id, note)
  );
export const useRejectPaymentRequest = () =>
  useAction('rejected', ({ id, reason }: WithReason) => api.rejectPaymentRequest(id, reason));
export const useCancelPaymentRequest = () =>
  useAction('cancelled', ({ id, reason }: WithReason) => api.cancelPaymentRequest(id, reason));

/* ---------- Payment voucher ---------- */
export const useCreatePayment = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PaymentVoucherInput) => api.createPayment(input), onDone);
export const usePayVoucher = () =>
  useAction('paid', ({ id, input }: WithId & { input: PayInput }) => api.payVoucher(id, input));
export const useVoidPayment = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidPayment(id, reason));

/* ---------- Return ---------- */
export const useCreateReturn = (onDone?: (doc: WithId & Doc) => void) =>
  useAction('created', (input: PurchaseReturnInput) => api.createReturn(input), onDone);
export const usePostReturn = () => useAction('posted', ({ id }: WithId) => api.postReturn(id));
export const useRefundReturn = () =>
  useAction('refunded', ({ id, input }: WithId & { input: RefundInput }) =>
    api.refundReturn(id, input)
  );
export const useVoidReturn = () =>
  useAction('voided', ({ id, reason }: WithReason) => api.voidReturn(id, reason));

/* ---------- Files ---------- */
export const useUploadAttachments = () =>
  useAction(
    'uploaded',
    async ({
      target,
      id,
      files,
      requestFile,
      quoteId,
      kind,
    }: {
      target: api.AttachmentTarget;
      id: string;
      files: File[];
      /** On an FPPBJ: the request itself, its IOM memo or one quote. */
      requestFile?: api.RequestFileTarget;
      quoteId?: string;
      /** On a bill: which file this is; one active file per kind. */
      kind?: AttachmentKind;
    }) => {
      await api.uploadAttachments(target, id, files, requestFile, quoteId, kind);
      return {} as { number?: string };
    }
  );
