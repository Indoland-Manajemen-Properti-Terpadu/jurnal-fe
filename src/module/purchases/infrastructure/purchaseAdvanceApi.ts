import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type { ApiEnvelope } from '@/module/purchases/infrastructure/purchaseDto';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';

export interface OrderAdvanceCancellationResult {
  purchaseOrder: string;
  paymentRequest: { _id: string; status: 'CANCELLED'; cancelReason?: string };
  paymentVoucher: { _id: string; status: 'VOID' } | null;
}

export const cancelOrderAdvance = async (
  orderId: string,
  requestId: string,
  reason: string
): Promise<OrderAdvanceCancellationResult> =>
  (
    await http.post<ApiEnvelope<OrderAdvanceCancellationResult>>(
      PURCHASE_API.orderAdvanceCancel(orderId, requestId),
      { reason }
    )
  ).data;
