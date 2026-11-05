import type { TaxRef } from '@/module/purchases/domain/purchaseCommon';
import type { PurchaseBill, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseBillInput } from '@/module/purchases/domain/purchaseInputs';
import {
  calculateTotals,
  remainingQty,
  type Totals,
} from '@/module/purchases/domain/purchaseTotals';
import { itemName } from '@/module/purchases/domain/receiptForm';

/** Same tolerance the backend applies when it compares the vendor's invoice total (Rp1). */
export const TOTAL_TOLERANCE = 1;
const QTY_EPSILON = 1e-4;

export interface BillableLine {
  itemId: string;
  name: string;
  unitName: string | null;
  /** Most that can go on this bill: received and not yet billed (plus this bill's own quantity). */
  maxQty: number;
  poUnitPrice: number;
  poTaxId: string;
}

export interface BillLineValues {
  quantity: number;
  unitPrice: number;
  taxId: string;
}

export interface BillFormValues {
  date: string;
  vendorInvoiceNumber: string;
  vendorInvoiceTotal: number | '';
  dueDate: string;
  paymentTermId: string;
  memo: string;
  lines: Record<string, BillLineValues>;
}

/** Order lines that can be billed: received more than already billed. */
export const billableLines = (
  order: PurchaseOrder,
  ownQuantities: Record<string, number> = {}
): BillableLine[] =>
  order.items
    .map((item) => ({
      itemId: item.id,
      name: itemName(item),
      unitName: item.unitName,
      maxQty: remainingQty(item.receivedQty, item.billedQty - (ownQuantities[item.id] ?? 0)),
      poUnitPrice: item.unitPrice,
      poTaxId: item.tax?.id ?? '',
    }))
    .filter((line) => line.maxQty > QTY_EPSILON);

/** Adds days to a `YYYY-MM-DD` day without time-zone drift. */
export const addDays = (day: string, days: number): string => {
  const [year, month, date] = day.split('-').map(Number);
  if (!year || !month || !date) return '';
  const moved = new Date(Date.UTC(year, month - 1, date + days));
  return moved.toISOString().slice(0, 10);
};

/** Due date from a term in days; empty when the term is unknown so the server decides. */
export const dueDateFor = (date: string, days: number | null): string =>
  date && days !== null ? addDays(date, days) : '';

export const defaultBillForm = (
  order: PurchaseOrder,
  lines: BillableLine[],
  today: string,
  termDays: number | null,
  termId: string
): BillFormValues => ({
  date: today,
  vendorInvoiceNumber: '',
  vendorInvoiceTotal: '',
  dueDate: dueDateFor(today, termDays),
  paymentTermId: termId,
  memo: '',
  lines: Object.fromEntries(
    lines.map((line) => [
      line.itemId,
      { quantity: line.maxQty, unitPrice: line.poUnitPrice, taxId: line.poTaxId },
    ])
  ),
});

export const billToForm = (bill: PurchaseBill, termId: string): BillFormValues => ({
  date: bill.date,
  vendorInvoiceNumber: bill.vendorInvoiceNumber,
  vendorInvoiceTotal: bill.vendorInvoiceTotal ?? '',
  dueDate: bill.dueDate ?? '',
  paymentTermId: termId,
  memo: bill.memo,
  lines: Object.fromEntries(
    bill.items.map((item) => [
      item.purchaseOrderItemId,
      { quantity: item.quantity, unitPrice: item.unitPrice, taxId: item.tax?.id ?? '' },
    ])
  ),
});

/** True when any line differs from "bill everything received at the order's price and tax". */
export const isCustomized = (values: BillFormValues, lines: BillableLine[]): boolean =>
  lines.some((line) => {
    const current = values.lines[line.itemId];
    return (
      !current ||
      Math.abs(current.quantity - line.maxQty) > QTY_EPSILON ||
      current.unitPrice !== line.poUnitPrice ||
      current.taxId !== line.poTaxId
    );
  });

export const clampBilled = (value: number | string, max: number): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return 0;
  return Math.min(Math.round(parsed * 1e4) / 1e4, max);
};

export const toNumber = (value: number | string): number | '' => {
  if (value === '' || value === null) return '';
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : '';
};

/**
 * Estimate of the bill, shaped like the order it is taken from: the discount and withholding of the
 * order apply to the part that is billed (a fixed amount is shared by the billed part of the order).
 */
export const estimateBill = (
  order: PurchaseOrder,
  lines: BillableLine[],
  values: BillFormValues,
  taxes: TaxRef[]
): Totals => {
  const active = lines.filter((line) => (values.lines[line.itemId]?.quantity ?? 0) > QTY_EPSILON);
  const billedAtOrderPrice = active.reduce(
    (sum, line) => sum + (values.lines[line.itemId]?.quantity ?? 0) * line.poUnitPrice,
    0
  );
  const share = order.subtotal > 0 ? Math.min(1, billedAtOrderPrice / order.subtotal) : 0;
  const prorate = (type: 'percentage' | 'nominal' | null, value: number) =>
    type === 'nominal' ? Math.round(value * share * 100) / 100 : value;
  const rate = (taxId: string) => taxes.find((tax) => tax.id === taxId)?.rate ?? 0;

  return calculateTotals({
    lines: active.map((line) => {
      const current = values.lines[line.itemId];
      return {
        quantity: current.quantity,
        unitPrice: current.unitPrice,
        taxRate: rate(current.taxId),
      };
    }),
    isPriceIncludeTax: order.isPriceIncludeTax,
    discountType: order.discountType,
    discountValue: prorate(order.discountType, order.discountValue),
    withholdingType: order.withholdingType,
    withholdingValue: prorate(order.withholdingType, order.withholdingValue),
  });
};

export interface VarianceNotice {
  type: 'PRICE' | 'TOTAL';
  itemName?: string;
  expected: number;
  actual: number;
}

/** What the three-way match will flag: a price above or below the order, or an invoice total that differs. */
export const detectVariances = (
  values: BillFormValues,
  lines: BillableLine[],
  estimate: Totals
): VarianceNotice[] => {
  const notices: VarianceNotice[] = [];
  lines.forEach((line) => {
    const current = values.lines[line.itemId];
    if (current && current.quantity > QTY_EPSILON && current.unitPrice !== line.poUnitPrice) {
      notices.push({
        type: 'PRICE',
        itemName: line.name,
        expected: line.poUnitPrice,
        actual: current.unitPrice,
      });
    }
  });
  if (
    values.vendorInvoiceTotal !== '' &&
    Math.abs(values.vendorInvoiceTotal - estimate.finalAmount) > TOTAL_TOLERANCE
  ) {
    notices.push({
      type: 'TOTAL',
      expected: estimate.finalAmount,
      actual: values.vendorInvoiceTotal,
    });
  }
  return notices;
};

export type BillDateError = 'required' | null;
export type DueDateError = 'beforeDate' | null;

export interface BillErrors {
  date: BillDateError;
  dueDate: DueDateError;
  noQuantity: boolean;
  invalidInvoiceTotal: boolean;
  /** Lines whose quantity is above what can still be billed, or whose price is negative. */
  invalidLineIds: string[];
}

export const validateBill = (values: BillFormValues, lines: BillableLine[]): BillErrors => {
  const invalidLineIds = lines
    .filter((line) => {
      const current = values.lines[line.itemId];
      return !current || current.quantity > line.maxQty + QTY_EPSILON || current.unitPrice < 0;
    })
    .map((line) => line.itemId);
  return {
    date: values.date ? null : 'required',
    dueDate: values.dueDate && values.date && values.dueDate < values.date ? 'beforeDate' : null,
    noQuantity: !lines.some((line) => (values.lines[line.itemId]?.quantity ?? 0) > QTY_EPSILON),
    invalidInvoiceTotal: values.vendorInvoiceTotal !== '' && values.vendorInvoiceTotal < 0,
    invalidLineIds,
  };
};

export const hasBillErrors = (errors: BillErrors): boolean =>
  errors.date !== null ||
  errors.dueDate !== null ||
  errors.noQuantity ||
  errors.invalidInvoiceTotal ||
  errors.invalidLineIds.length > 0;

const billedItems = (values: BillFormValues, lines: BillableLine[]) =>
  lines
    .filter((line) => (values.lines[line.itemId]?.quantity ?? 0) > QTY_EPSILON)
    .map((line) => {
      const current = values.lines[line.itemId];
      return {
        purchaseOrderItem: line.itemId,
        quantity: current.quantity,
        unitPrice: current.unitPrice,
        tax: current.taxId || null,
      };
    });

/** `items` is sent only when a line was changed; otherwise the server bills everything received. */
export const toBillInput = (
  values: BillFormValues,
  lines: BillableLine[],
  orderId: string
): PurchaseBillInput => ({
  purchaseOrder: orderId,
  transactionDate: values.date,
  ...(values.vendorInvoiceNumber.trim()
    ? { vendorInvoiceNumber: values.vendorInvoiceNumber.trim() }
    : {}),
  ...(values.vendorInvoiceTotal !== '' ? { vendorInvoiceTotal: values.vendorInvoiceTotal } : {}),
  ...(values.dueDate ? { dueDate: values.dueDate } : {}),
  ...(values.paymentTermId ? { paymentTerm: values.paymentTermId } : {}),
  ...(values.memo.trim() ? { memo: values.memo.trim() } : {}),
  ...(isCustomized(values, lines)
    ? {
        items: billedItems(values, lines).map(({ tax, ...rest }) => ({
          ...rest,
          ...(tax ? { tax } : {}),
        })),
      }
    : {}),
});

/** Saving a draft takes the same fields without the order, with explicit nulls to clear a field. */
export interface BillUpdateInput {
  transactionDate: string;
  vendorInvoiceNumber: string;
  vendorInvoiceTotal: number | null;
  dueDate?: string;
  paymentTerm: string | null;
  memo: string;
  items: { purchaseOrderItem: string; quantity: number; unitPrice: number; tax: string | null }[];
}

export const toBillUpdateInput = (
  values: BillFormValues,
  lines: BillableLine[]
): BillUpdateInput => ({
  transactionDate: values.date,
  vendorInvoiceNumber: values.vendorInvoiceNumber.trim(),
  vendorInvoiceTotal: values.vendorInvoiceTotal === '' ? null : values.vendorInvoiceTotal,
  // The service refuses a null due date and recomputes one that is left out.
  ...(values.dueDate ? { dueDate: values.dueDate } : {}),
  paymentTerm: values.paymentTermId || null,
  memo: values.memo.trim(),
  items: billedItems(values, lines),
});
