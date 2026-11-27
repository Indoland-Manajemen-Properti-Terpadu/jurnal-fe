import type { Page } from '@/module/purchases/domain/purchaseCommon';
import type {
  PriceChangeInput,
  PriceChangeRequest,
} from '@/module/purchases/domain/purchasePriceChanges';
import type { ListParams } from '@/module/purchases/infrastructure/purchaseApi';
import type { ApiEnvelope, ListDto } from '@/module/purchases/infrastructure/purchaseDto';
import type { PriceChangeDto } from '@/module/purchases/infrastructure/purchasePriceChangeDto';
import { toPriceChangeRequest } from '@/module/purchases/infrastructure/purchasePriceChangeMappers';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import { toPage } from '@/module/purchases/infrastructure/purchaseMappers';

export interface PriceChangeListParams extends ListParams {
  purchaseOrder?: string;
}

const map = (dto: PriceChangeDto): PriceChangeRequest => {
  const result = toPriceChangeRequest(dto);
  if (!result) throw new Error('Price change response is empty');
  return result;
};

export const listPriceChanges = async (
  params: PriceChangeListParams = {}
): Promise<Page<PriceChangeRequest>> => {
  const { data } = await http.get<ApiEnvelope<ListDto<PriceChangeDto>>>(
    PURCHASE_API.priceChanges,
    params
  );
  return toPage(data, map);
};

export const createPriceChange = async (
  orderId: string,
  input: PriceChangeInput
): Promise<PriceChangeRequest> => {
  const { data } = await http.post<ApiEnvelope<PriceChangeDto>>(
    PURCHASE_API.priceChangesForOrder(orderId),
    input
  );
  return map(data);
};

export const approvePriceChange = async (
  changeId: string,
  approvalStage: number,
  note?: string
): Promise<PriceChangeRequest> => {
  const { data } = await http.post<ApiEnvelope<PriceChangeDto>>(
    PURCHASE_API.priceChangeAction(changeId, 'approve'),
    { approvalStage, ...(note?.trim() ? { note: note.trim() } : {}) }
  );
  return map(data);
};

export const rejectPriceChange = async (
  changeId: string,
  approvalStage: number,
  reason: string
): Promise<PriceChangeRequest> => {
  const { data } = await http.post<ApiEnvelope<PriceChangeDto>>(
    PURCHASE_API.priceChangeAction(changeId, 'reject'),
    { approvalStage, reason: reason.trim() }
  );
  return map(data);
};
