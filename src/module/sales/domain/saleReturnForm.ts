import type { Sale } from './sale';
import { hasIssuedReturn } from './saleLocks';
import type { ReturnReason, ReturnSettlement, SaleReturn } from './saleReturn';
import { RETURN_REASONS } from './saleReturn';

/** One invoice line as the return form shows it, with how much of it can still be returned. */
export interface ReturnFormLine {
  saleItem: string;
  name: string;
  description: string;
  unitPrice: number;
  /** Quantity on the invoice. */
  quantity: number;
  /** Already taken back by issued returns. */
  returned: number;
  /** What is left to return: quantity minus returned, never below 0. */
  remaining: number;
  /** What this return takes back. */
  returnQty: number;
  /** The invoice line's own figures; a return takes back the same share of each as of its quantity. */
  lineAmount: number;
  lineDiscount: number;
  lineTax: number;
  lineWithholding: number;
  taxName: string;
}

export interface ReturnFormValues {
  sale: string;
  transactionDate: string;
  reason: ReturnReason;
  settlement: ReturnSettlement;
  memo: string;
  lines: ReturnFormLine[];
}

const QTY_EPSILON = 1e-4;

/** The invoice's lines as an empty return: nothing is taken back until the user says so. */
export const returnLinesOf = (sale: Pick<Sale, 'items'>): ReturnFormLine[] =>
  sale.items
    .filter((item) => item.id ?? item._id)
    .map((item) => {
      const returned = item.returnedQty ?? 0;
      return {
        saleItem: (item.id ?? item._id) as string,
        name: item.product?.name || item.description || '',
        description: item.description ?? '',
        unitPrice: item.unitPrice,
        quantity: item.quantity,
        returned,
        remaining: Math.max(item.quantity - returned, 0),
        returnQty: 0,
        lineAmount: item.amount ?? 0,
        lineDiscount: item.discountAmount ?? 0,
        lineTax: item.taxAmount ?? 0,
        lineWithholding: item.withholdingAmount ?? 0,
        taxName: item.tax?.name ?? '',
      };
    });

export const emptyReturnForm = (sale: Sale, today: string): ReturnFormValues => ({
  sale: sale.id,
  transactionDate: today,
  reason: RETURN_REASONS[0],
  settlement: 'REDUCE_INVOICE',
  memo: '',
  lines: returnLinesOf(sale),
});

/** Form values of a stored draft, with the quantities it already takes back. */
export const returnToFormValues = (ret: SaleReturn, sale: Sale): ReturnFormValues => {
  const taken = new Map(ret.items.map((item) => [item.saleItem, item.quantity]));
  return {
    sale: sale.id,
    transactionDate: (ret.transactionDate ?? '').slice(0, 10),
    reason: (RETURN_REASONS as readonly string[]).includes(ret.reason)
      ? (ret.reason as ReturnReason)
      : RETURN_REASONS[0],
    settlement: ret.settlement,
    memo: ret.memo,
    lines: returnLinesOf(sale).map((line) => ({
      ...line,
      returnQty: taken.get(line.saleItem) ?? 0,
    })),
  };
};

/** "Retur semua": every line takes back what is left of it. */
export const returnAll = (lines: ReturnFormLine[]): ReturnFormLine[] =>
  lines.map((line) => ({ ...line, returnQty: line.remaining }));

const cents = (value: number): number => Math.round(value * 100) / 100;

/** The share of an invoice line's figure that `returnQty` of its `quantity` represents. */
const share = (line: ReturnFormLine, figure: number): number =>
  line.quantity > 0 ? cents((figure * Math.max(line.returnQty, 0)) / line.quantity) : 0;

export interface ReturnLineEstimate {
  /** What the returned quantity is worth before the invoice discount. */
  gross: number;
  discount: number;
  /** Per unit, after the discount: what the customer really paid for one. */
  netUnit: number;
  tax: number;
  withholding: number;
  /** Gross less discount, so the line total shown beside the tax. */
  total: number;
}

export const estimateReturnLine = (line: ReturnFormLine): ReturnLineEstimate => {
  const gross = share(line, line.lineAmount);
  const discount = share(line, line.lineDiscount);
  return {
    gross,
    discount,
    netUnit: line.quantity > 0 ? cents((line.lineAmount - line.lineDiscount) / line.quantity) : 0,
    tax: share(line, line.lineTax),
    withholding: share(line, line.lineWithholding),
    total: cents(gross - discount),
  };
};

export interface ReturnEstimate {
  subtotal: number;
  discount: number;
  tax: number;
  withholding: number;
  total: number;
}

/**
 * What the return should come to: the same share of each invoice line's amount, discount, tax and
 * withholding as the quantity returned. The server prices the return when the draft is saved and
 * its figure wins; this is shown so the user sees roughly what they are about to issue.
 */
export const estimateReturn = (lines: ReturnFormLine[]): ReturnEstimate => {
  const parts = lines.map(estimateReturnLine);
  const sum = (pick: (part: ReturnLineEstimate) => number) =>
    cents(parts.reduce((total, part) => total + pick(part), 0));
  const subtotal = sum((part) => part.gross);
  const discount = sum((part) => part.discount);
  const tax = sum((part) => part.tax);
  const withholding = sum((part) => part.withholding);
  return {
    subtotal,
    discount,
    tax,
    withholding,
    total: cents(subtotal - discount + tax - withholding),
  };
};

export type ReturnFormErrors = Record<string, string>;

/** Errors by field path; each value is an i18n key under `salesReturns`. */
export const validateReturnForm = (
  values: ReturnFormValues,
  invoiceDate: string | null | undefined
): ReturnFormErrors => {
  const errors: ReturnFormErrors = {};
  const date = (invoiceDate ?? '').slice(0, 10);
  if (!values.transactionDate) errors.transactionDate = 'validation.dateRequired';
  else if (date && values.transactionDate < date) {
    errors.transactionDate = 'validation.dateBeforeInvoice';
  }
  values.lines.forEach((line, index) => {
    if (line.returnQty < 0) errors[`lines.${index}`] = 'validation.quantityNegative';
    else if (line.returnQty > line.remaining + QTY_EPSILON) {
      errors[`lines.${index}`] = 'validation.quantityOver';
    }
  });
  if (!values.lines.some((line) => line.returnQty > 0)) errors.lines = 'validation.linesRequired';
  return errors;
};

export const canSaveReturn = (
  values: ReturnFormValues,
  invoiceDate: string | null | undefined
): boolean => Object.keys(validateReturnForm(values, invoiceDate)).length === 0;

/** A return needs an invoice that is issued and not void; a draft or void invoice cannot be corrected. */
export const canReturnSale = (sale: Pick<Sale, 'displayStatus'>): boolean => {
  const { code } = sale.displayStatus;
  return code === 'UNPAID' || code === 'OVERDUE' || code === 'PAID';
};

export { hasIssuedReturn };
