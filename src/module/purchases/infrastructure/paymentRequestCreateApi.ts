import type { PaymentRequestInput } from '@/module/purchases/domain/paymentRequest';
import type { ApiEnvelope, PaymentRequestDto } from '@/module/purchases/infrastructure/purchaseDto';
import { toPaymentRequest } from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';

/** Creates a draft payment request together with its proforma files in one atomic request. */
export const createPaymentRequestWithAttachments = async (
  input: PaymentRequestInput,
  files: File[]
) => {
  const form = new FormData();
  form.append('kind', input.kind);
  form.append('transactionDate', input.transactionDate);
  if (input.purchaseOrder) form.append('purchaseOrder', input.purchaseOrder);
  if (input.amount !== undefined) form.append('amount', String(input.amount));
  if (input.advanceAccount) form.append('advanceAccount', input.advanceAccount);
  if (input.memo) form.append('memo', input.memo);
  files.forEach((file) => form.append('attachments', file));
  const body = await http.upload<ApiEnvelope<PaymentRequestDto>>(
    PURCHASE_API.paymentRequests,
    form
  );
  return toPaymentRequest(body.data);
};
