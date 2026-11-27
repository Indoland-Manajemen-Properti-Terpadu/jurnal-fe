import type { OrderItem } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseOrderDto } from '@/module/purchases/infrastructure/purchaseDto';
import { toDateOrNull, toProduct, toTax } from '@/module/purchases/infrastructure/purchaseMappers';

export const toOrderItem = (dto: PurchaseOrderDto['items'][number]): OrderItem => ({
  id: dto._id,
  requestItemId: dto.requestItem,
  product: toProduct(dto.product),
  description: dto.description ?? '',
  specification: dto.specification ?? '',
  quantity: dto.quantity,
  unitName: dto.unit?.name ?? dto.product?.unit?.name ?? null,
  unitPrice: dto.unitPrice,
  tax: toTax(dto.tax),
  discountAmount: dto.discountAmount,
  taxAmount: dto.taxAmount,
  amount: dto.amount,
  receivedQty: dto.receivedQty,
  billedQty: dto.billedQty,
  status: dto.status ?? undefined,
  statusLabel: dto.statusLabel ?? undefined,
  billOnly: Boolean(dto.billOnly),
  reorderSelectable: dto.reorderSelectable !== false,
  previousUnitPrice: dto.previousUnitPrice ?? null,
  schedule: {
    kind: dto.schedule?.kind ?? 'FULL',
    seq: dto.schedule?.seq ?? 1,
    of: dto.schedule?.of ?? 1,
    periodFrom: toDateOrNull(dto.schedule?.periodFrom),
    periodTo: toDateOrNull(dto.schedule?.periodTo),
  },
});
