import type { OrderItem, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { GoodsReceiptInput } from '@/module/purchases/domain/purchaseInputs';
import { remainingQty } from '@/module/purchases/domain/purchaseTotals';

export interface ReceiptLine {
  itemId: string;
  name: string;
  unitName: string | null;
  ordered: number;
  received: number;
  remaining: number;
}

export interface ReceiptFormValues {
  date: string;
  deliveryNote: string;
  memo: string;
  /** Quantity received now, per order line id; 0 skips the line. */
  quantities: Record<string, number>;
}

export type ReceiptDateError = 'required' | 'beforeOrder' | null;

export interface ReceiptErrors {
  date: ReceiptDateError;
  noQuantity: boolean;
  /** Lines whose quantity is above what is still open. */
  overIds: string[];
}

const QTY_EPSILON = 1e-4;

export const itemName = (item: Pick<OrderItem, 'product' | 'description'>): string =>
  item.product?.name || item.description || '-';

/** An order can take a receipt while it is approved or partly received. */
export const canReceive = (order: PurchaseOrder): boolean =>
  order.status === 'APPROVED' || order.status === 'PARTIAL_RECEIVED';

export const receiptLines = (order: PurchaseOrder): ReceiptLine[] =>
  order.items.map((item) => ({
    itemId: item.id,
    name: itemName(item),
    unitName: item.unitName,
    ordered: item.quantity,
    received: item.receivedQty,
    remaining: remainingQty(item.quantity, item.receivedQty),
  }));

/** Nothing is pre-filled: recording goods that did not arrive would post a journal. */
export const emptyReceiptForm = (order: PurchaseOrder, today: string): ReceiptFormValues => ({
  date: today,
  deliveryNote: '',
  memo: '',
  quantities: Object.fromEntries(order.items.map((item) => [item.id, 0])),
});

export const clampReceived = (value: number | string, remaining: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed * 1e4) / 1e4, remaining);
};

/** Fills every line with what is still open ("receive everything that remains"). */
export const receiveAllRemaining = (values: ReceiptFormValues, lines: ReceiptLine[]) => ({
  ...values,
  quantities: Object.fromEntries(lines.map((line) => [line.itemId, line.remaining])),
});

export const validateReceipt = (
  values: ReceiptFormValues,
  order: PurchaseOrder,
  lines: ReceiptLine[]
): ReceiptErrors => {
  let date: ReceiptDateError = null;
  if (!values.date) date = 'required';
  else if (values.date < order.date) date = 'beforeOrder';
  const overIds = lines
    .filter((line) => (values.quantities[line.itemId] ?? 0) > line.remaining + QTY_EPSILON)
    .map((line) => line.itemId);
  const noQuantity = !lines.some((line) => (values.quantities[line.itemId] ?? 0) > QTY_EPSILON);
  return { date, noQuantity, overIds };
};

export const hasReceiptErrors = (errors: ReceiptErrors): boolean =>
  errors.date !== null || errors.noQuantity || errors.overIds.length > 0;

export const toReceiptInput = (values: ReceiptFormValues, orderId: string): GoodsReceiptInput => ({
  purchaseOrder: orderId,
  transactionDate: values.date,
  ...(values.deliveryNote.trim() ? { deliveryNote: values.deliveryNote.trim() } : {}),
  ...(values.memo.trim() ? { memo: values.memo.trim() } : {}),
  items: Object.entries(values.quantities)
    .filter(([, quantity]) => quantity > QTY_EPSILON)
    .map(([purchaseOrderItem, receivedQty]) => ({ purchaseOrderItem, receivedQty })),
});
