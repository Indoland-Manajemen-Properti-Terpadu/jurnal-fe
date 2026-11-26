import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseOrderDto } from '@/module/purchases/infrastructure/purchaseDto';

export const toOrderSent = (dto: PurchaseOrderDto): PurchaseOrder['sent'] => ({
  byEmail: Boolean(dto.sentByEmail),
  to: dto.sentTo ?? '',
  cc: dto.sentCc ?? [],
  note: dto.sentNote ?? '',
});
