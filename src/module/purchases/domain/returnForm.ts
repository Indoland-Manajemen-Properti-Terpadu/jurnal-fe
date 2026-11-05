import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import type { PurchaseBill, PurchaseReturn } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseReturnInput } from '@/module/purchases/domain/purchaseInputs';

export interface ReturnLine {
  itemId: string;
  name: string;
  unitName: string;
  billed: number;
  returned: number;
  /** What can still go back: billed minus what earlier returns already took. */
  returnable: number;
  amount: number;
  discountAmount: number;
  taxAmount: number;
}

export interface ReturnFormValues {
  date: string;
  reason: string;
  memo: string;
  quantities: Record<string, number>;
}

export interface ReturnUpdateInput {
  transactionDate: string;
  reason: string;
  memo?: string;
  items: { billItem: string; quantity: number }[];
}

export interface ReturnPreview {
  amount: number;
  discountAmount: number;
  net: number;
  taxAmount: number;
  withholdingAmount: number;
  finalAmount: number;
}

const MIN_REASON = 3;
const QTY_EPSILON = 1e-4;

export const canReturn = (bill: PurchaseBill): boolean =>
  bill.status === 'VERIFIED' || bill.status === 'PARTIAL_PAID' || bill.status === 'PAID';

export const returnLines = (bill: PurchaseBill): ReturnLine[] =>
  bill.items.map((item) => ({
    itemId: item.id,
    name: item.product?.name ?? item.description,
    unitName: item.unitName ?? '',
    billed: item.quantity,
    returned: item.returnedQty,
    returnable: Math.max(0, Math.round((item.quantity - item.returnedQty) * 1e4) / 1e4),
    amount: item.amount,
    discountAmount: item.discountAmount,
    taxAmount: item.taxAmount,
  }));

export const emptyReturnForm = (date: string): ReturnFormValues => ({
  date,
  reason: '',
  memo: '',
  quantities: {},
});

export const clampReturnQty = (value: number | string, max: number): number => {
  const number = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(number) || number <= 0) return 0;
  return Math.min(number, max);
};

/** Share of a line total that belongs to `done` of `total` units, in minor units. */
const share = (lineTotal: number, done: number, total: number): number =>
  total > 0 ? Math.round((toMinor(lineTotal) * done) / total) : 0;

/**
 * Estimate of what returning the chosen quantities is worth, from the bill's own line figures:
 * a line's amount, discount and tax in proportion to the quantity, and the withholding in
 * proportion to the net. Shares come from running totals so a return in steps adds up to the
 * bill, like the server's. The server recalculates and owns the final figures.
 */
export const previewReturn = (
  bill: PurchaseBill,
  quantities: Record<string, number>
): ReturnPreview => {
  const pieces = bill.items.map((item) => {
    const qty = Math.min(quantities[item.id] ?? 0, Math.max(0, item.quantity - item.returnedQty));
    const before = item.returnedQty;
    const after = before + qty;
    const piece = (total: number) =>
      share(total, after, item.quantity) - share(total, before, item.quantity);
    return {
      amount: piece(item.amount),
      discount: piece(item.discountAmount),
      tax: piece(item.taxAmount),
      netBefore:
        share(item.amount, before, item.quantity) -
        share(item.discountAmount, before, item.quantity),
      netAfter:
        share(item.amount, after, item.quantity) - share(item.discountAmount, after, item.quantity),
    };
  });

  const amount = sumMinor(pieces.map((p) => p.amount));
  const discount = sumMinor(pieces.map((p) => p.discount));
  const tax = sumMinor(pieces.map((p) => p.tax));
  const net = amount - discount;

  const base = toMinor(bill.subtotal) - toMinor(bill.discountAmount);
  const whOf = (netMinor: number) =>
    base > 0 ? Math.round((toMinor(bill.withholdingAmount) * netMinor) / base) : 0;
  const withholding =
    whOf(sumMinor(pieces.map((p) => p.netAfter))) - whOf(sumMinor(pieces.map((p) => p.netBefore)));

  const toAmount = (minor: number) => Number(fromMinor(minor));
  return {
    amount: toAmount(amount),
    discountAmount: toAmount(discount),
    net: toAmount(net),
    taxAmount: toAmount(tax),
    withholdingAmount: toAmount(withholding),
    finalAmount: toAmount(net + tax - withholding),
  };
};

/**
 * Where the value of a posted return goes: first against what the bill still owes, the rest
 * becomes vendor credit (always, for a bill that is already settled).
 */
export const splitReturn = (
  finalAmount: number,
  remainingAmount: number
): { appliedToBill: number; credit: number } => {
  const applied = Math.min(Math.max(remainingAmount, 0), finalAmount);
  return {
    appliedToBill: applied,
    credit: Number(fromMinor(toMinor(finalAmount) - toMinor(applied))),
  };
};

export interface ReturnErrors {
  date: 'required' | 'beforeBill' | null;
  reason: boolean;
  noQuantity: boolean;
  overIds: string[];
}

export const validateReturn = (
  values: ReturnFormValues,
  bill: PurchaseBill,
  lines: ReturnLine[]
): ReturnErrors => {
  let date: ReturnErrors['date'] = null;
  if (!values.date) date = 'required';
  else if (values.date < bill.date) date = 'beforeBill';
  return {
    date,
    reason: values.reason.trim().length < MIN_REASON,
    noQuantity: !lines.some((line) => (values.quantities[line.itemId] ?? 0) > 0),
    overIds: lines
      .filter((line) => (values.quantities[line.itemId] ?? 0) > line.returnable + QTY_EPSILON)
      .map((line) => line.itemId),
  };
};

export const hasReturnErrors = (errors: ReturnErrors): boolean =>
  errors.date !== null || errors.reason || errors.noQuantity || errors.overIds.length > 0;

const items = (values: ReturnFormValues) =>
  Object.entries(values.quantities)
    .filter(([, quantity]) => quantity > 0)
    .map(([billItem, quantity]) => ({ billItem, quantity }));

export const toReturnInput = (values: ReturnFormValues, billId: string): PurchaseReturnInput => ({
  bill: billId,
  transactionDate: values.date,
  reason: values.reason.trim(),
  memo: values.memo.trim() || undefined,
  items: items(values),
});

export const toReturnUpdateInput = (values: ReturnFormValues): ReturnUpdateInput => ({
  transactionDate: values.date,
  reason: values.reason.trim(),
  memo: values.memo.trim(),
  items: items(values),
});

export const returnFormFromReturn = (doc: PurchaseReturn): ReturnFormValues => ({
  date: doc.date,
  reason: doc.reason,
  memo: doc.memo,
  quantities: Object.fromEntries(doc.items.map((item) => [item.billItemId, item.quantity])),
});
