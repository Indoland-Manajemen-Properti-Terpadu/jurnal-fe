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
  /** Stocked goods need a warehouse to land in. */
  stocked: boolean;
}

export const RECEIPT_MAX_FILES = 5;

export interface ReceiptFormValues {
  date: string;
  warehouseId: string;
  deliveryNote: string;
  memo: string;
  /** Quantity received now, per order line id; 0 skips the line. */
  quantities: Record<string, number>;
  /** Goods turned away at delivery, per order line id. */
  rejected: Record<string, number>;
  /** The signed BAPP; a service receipt cannot be recorded without it. */
  files: File[];
}

export type ReceiptDateError = 'required' | 'beforeOrder' | null;

export interface ReceiptErrors {
  date: ReceiptDateError;
  noQuantity: boolean;
  warehouse: boolean;
  /** A BAPP carries its own number (the service refuses a blank one). */
  deliveryNote: boolean;
  /** A BAPP needs the signed file. */
  files: boolean;
  /** Lines whose quantity is above what is still open. */
  overIds: string[];
}

const QTY_EPSILON = 1e-4;

export const itemName = (item: Pick<OrderItem, 'product' | 'description'>): string =>
  item.product?.name || item.description || '-';

/**
 * A sent or partly received order that uses receipts can take one. An order billed straight from the
 * order takes none (the service answers 400), so the screens hide the way in.
 */
export const canReceive = (order: PurchaseOrder): boolean =>
  order.withReceipt && (order.status === 'SENT' || order.status === 'PARTIAL_RECEIVED');

/** Lines that are only billed (an advance, shipping) are never received. */
export const receiptLines = (order: PurchaseOrder): ReceiptLine[] =>
  order.items
    .filter((item) => !item.billOnly)
    .map((item) => ({
      itemId: item.id,
      name: itemName(item),
      unitName: item.unitName,
      ordered: item.quantity,
      received: item.receivedQty,
      remaining: remainingQty(item.quantity, item.receivedQty),
      stocked: Boolean(item.product?.isInventory),
    }));

/** The warehouse the receipt starts with: the order's own, or the only active one. */
export const defaultWarehouse = (order: PurchaseOrder, active: { id: string }[]): string =>
  order.warehouse?.id ?? (active.length === 1 ? active[0].id : '');

/** The service asks for a warehouse when stocked goods arrive and more than one is active. */
export const needsWarehouse = (
  order: PurchaseOrder,
  lines: ReceiptLine[],
  values: ReceiptFormValues,
  activeWarehouses: number
): boolean =>
  !order.isService &&
  activeWarehouses > 1 &&
  lines.some((line) => line.stocked && (values.quantities[line.itemId] ?? 0) > QTY_EPSILON);

/** Nothing is pre-filled: recording goods that did not arrive would post a journal. */
export const emptyReceiptForm = (
  order: PurchaseOrder,
  today: string,
  warehouseId = ''
): ReceiptFormValues => ({
  date: today,
  warehouseId,
  deliveryNote: '',
  memo: '',
  quantities: Object.fromEntries(receiptLines(order).map((line) => [line.itemId, 0])),
  rejected: {},
  files: [],
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
  lines: ReceiptLine[],
  activeWarehouses = 0
): ReceiptErrors => {
  let date: ReceiptDateError = null;
  if (!values.date) date = 'required';
  else if (values.date < order.date) date = 'beforeOrder';
  const overIds = lines
    .filter((line) => (values.quantities[line.itemId] ?? 0) > line.remaining + QTY_EPSILON)
    .map((line) => line.itemId);
  const noQuantity = !lines.some((line) => (values.quantities[line.itemId] ?? 0) > QTY_EPSILON);
  const warehouse = needsWarehouse(order, lines, values, activeWarehouses) && !values.warehouseId;
  const service = Boolean(order.isService);
  const deliveryNote = service && !values.deliveryNote.trim();
  const files = service && values.files.length === 0;
  return { date, noQuantity, warehouse, deliveryNote, files, overIds };
};

export const hasReceiptErrors = (errors: ReceiptErrors): boolean =>
  errors.date !== null ||
  errors.noQuantity ||
  errors.warehouse ||
  errors.deliveryNote ||
  errors.files ||
  errors.overIds.length > 0;

export const toReceiptInput = (values: ReceiptFormValues, orderId: string): GoodsReceiptInput => ({
  purchaseOrder: orderId,
  transactionDate: values.date,
  ...(values.warehouseId ? { warehouse: values.warehouseId } : {}),
  ...(values.deliveryNote.trim() ? { deliveryNote: values.deliveryNote.trim() } : {}),
  ...(values.memo.trim() ? { memo: values.memo.trim() } : {}),
  ...(values.files.length > 0 ? { attachments: values.files } : {}),
  items: Object.entries(values.quantities)
    .filter(([, quantity]) => quantity > QTY_EPSILON)
    .map(([purchaseOrderItem, receivedQty]) => {
      const rejectedQty = values.rejected[purchaseOrderItem] ?? 0;
      return {
        purchaseOrderItem,
        receivedQty,
        ...(rejectedQty > QTY_EPSILON ? { rejectedQty } : {}),
      };
    }),
});
