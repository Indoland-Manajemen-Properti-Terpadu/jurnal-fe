import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';

export type EditableLine = { id: string; checked: boolean; quantity: number; unitPrice: number };

export const sourceLines = (order: PurchaseOrder): EditableLine[] =>
  order.items.map((item) => ({
    id: item.id,
    checked: item.reorderSelectable !== false,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
  }));
