import { sumMinor } from '@/lib/money/money';
import type { DiscountType, Sale, WithholdingType } from './sale';
import { fromCents, roundMinor, toCents } from './saleMoney';

export interface SaleLineInput {
  quantity: number;
  unitPrice: number;
  /** Tax rate in percent, 0 when the line has no tax. */
  taxRate: number;
}

export interface SaleTotalsInput {
  lines: SaleLineInput[];
  discountType: DiscountType;
  discountValue: number;
  withholdingType: WithholdingType;
  withholdingValue: number;
}

export interface SaleTotals {
  subtotal: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
  withholdingAmount: number;
  finalAmount: number;
}

export interface SaleListSummary {
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueCount: number;
}

// Unit price and nominal values are rounded to the cent once, then everything is integer cents.
// Line subtotal is rounded half up per line. Indonesian VAT (PPN) is charged on the price AFTER
// the discount (the tax base, DPP), so an invoice discount is first shared over the lines in
// proportion to their subtotal (largest remainder, so the shares add up exactly) and each line's
// tax is computed on what is left of it. Withholding (PPh) uses the same base: subtotal minus discount.
const lineSubtotalCents = ({ quantity, unitPrice }: SaleLineInput) =>
  roundMinor((quantity || 0) * toCents(unitPrice || 0));

const adjustmentCents = (type: 'percentage' | 'nominal', value: number, base: number) => {
  if (!(value > 0)) {
    return 0;
  }
  return type === 'percentage' ? roundMinor((base * value) / 100) : toCents(value);
};

/** Shares `amount` over `weights` proportionally; the shares always add up to `amount`. */
const allocate = (amount: number, weights: number[]): number[] => {
  const total = sumMinor(weights);
  if (amount <= 0 || total <= 0) return weights.map(() => 0);
  const exact = weights.map((weight) => (amount * weight) / total);
  const shares = exact.map(Math.floor);
  let left = amount - sumMinor(shares);
  exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction || a.index - b.index)
    .forEach(({ index }) => {
      if (left > 0) {
        shares[index] += 1;
        left -= 1;
      }
    });
  return shares;
};

export const calculateSaleTotals = (input: SaleTotalsInput): SaleTotals => {
  const subtotals = input.lines.map(lineSubtotalCents);
  const subtotal = sumMinor(subtotals);
  // A discount can never exceed the amount it applies to.
  const discount = Math.min(
    adjustmentCents(input.discountType, input.discountValue, subtotal),
    subtotal
  );
  const shares = allocate(discount, subtotals);
  const tax = sumMinor(
    input.lines.map((line, index) =>
      roundMinor(((subtotals[index] - shares[index]) * (line.taxRate || 0)) / 100)
    )
  );
  const taxBase = subtotal - discount;
  const withholding = adjustmentCents(input.withholdingType, input.withholdingValue, taxBase);
  const total = taxBase + tax;

  return {
    subtotal: fromCents(subtotal),
    discountAmount: fromCents(discount),
    taxTotal: fromCents(tax),
    total: fromCents(total),
    withholdingAmount: fromCents(withholding),
    finalAmount: fromCents(Math.max(0, total - withholding)),
  };
};

/** Amount still open after a (possibly partial) payment, in currency units. */
export const remainingAfterPayment = (remainingAmount: number, paymentAmount: number): number =>
  fromCents(toCents(remainingAmount) - toCents(paymentAmount));

/** Draft and void sales are not receivables, so they are never overdue. */
const NOT_RECEIVABLE = ['DRAFT', 'VOID'];
const isReceivable = (sale: Pick<Sale, 'status'>): boolean =>
  !NOT_RECEIVABLE.includes(String(sale.status || '').toUpperCase());

export const isPastDue = (
  sale: Pick<Sale, 'remainingAmount' | 'dueDate' | 'status'>,
  now: number
): boolean =>
  isReceivable(sale) &&
  sale.remainingAmount > 0 &&
  Boolean(sale.dueDate) &&
  new Date(sale.dueDate as string).getTime() < now;

export const summarizeSales = (sales: Sale[], now: number): SaleListSummary => {
  const receivables = sales.filter(isReceivable);
  const cents = (pick: (sale: Sale) => number) =>
    sumMinor(receivables.map((sale) => toCents(pick(sale) || 0)));

  return {
    totalAmount: fromCents(cents((sale) => sale.finalAmount)),
    paidAmount: fromCents(cents((sale) => sale.paidAmount)),
    remainingAmount: fromCents(cents((sale) => sale.remainingAmount)),
    overdueCount: receivables.filter((sale) => isPastDue(sale, now)).length,
  };
};

export type SaleTab = 'all' | 'UNPAID' | 'PAID' | 'DRAFT' | 'OVERDUE';

/** Client-side tab filter: the API only knows real statuses, not the derived overdue state. */
export const filterSalesByTab = (sales: Sale[], tab: string, now: number): Sale[] =>
  sales.filter((sale) => {
    const status = String(sale.status || 'DRAFT').toUpperCase();
    if (tab === 'OVERDUE') return isPastDue(sale, now);
    if (tab === 'UNPAID') {
      return (
        status === 'UNPAID' ||
        status === 'OPEN' ||
        status === 'PARTIAL' ||
        (sale.remainingAmount > 0 && status !== 'DRAFT')
      );
    }
    if (tab === 'PAID') {
      return status === 'PAID' || (sale.remainingAmount <= 0 && sale.paidAmount > 0);
    }
    if (tab === 'DRAFT') return status === 'DRAFT';
    return true;
  });
