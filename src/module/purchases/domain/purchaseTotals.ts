import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';

/**
 * Live estimate of an order or bill while it is typed. The server recomputes and owns the final
 * figures (`purchase.calc` on the backend); this follows the same order of steps so the preview
 * agrees for ordinary inputs: line amount, shared discount, tax on the discounted amount,
 * withholding on subtotal minus discount.
 */

export interface TotalsLine {
  quantity: number;
  unitPrice: number;
  /** Tax rate in percent, 0 when the line has no tax. */
  taxRate: number;
}

export interface TotalsInput {
  lines: TotalsLine[];
  isPriceIncludeTax: boolean;
  discountType: 'percentage' | 'nominal' | null;
  discountValue: number;
  withholdingType: 'percentage' | 'nominal' | null;
  withholdingValue: number;
}

export interface Totals {
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  withholdingAmount: number;
  finalAmount: number;
}

const percentOf = (minor: number, percent: number) => Math.round((minor * percent) / 100);

const lineBase = (line: TotalsLine, includesTax: boolean): number => {
  const gross = Math.round(line.quantity * toMinor(line.unitPrice));
  return includesTax && line.taxRate > 0 ? Math.round(gross / (1 + line.taxRate / 100)) : gross;
};

/** Spreads the discount over the lines in proportion to their amount; the remainder is never lost. */
const shareDiscount = (bases: number[], discount: number): number[] => {
  const subtotal = sumMinor(bases);
  if (subtotal <= 0 || discount <= 0) return bases.map(() => 0);
  const exact = bases.map((base) => (base * discount) / subtotal);
  const shares = exact.map(Math.floor);
  let rest = discount - sumMinor(shares);
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((a, b) => b.fraction - a.fraction);
  for (const { index } of order) {
    if (rest <= 0) break;
    shares[index] += 1;
    rest -= 1;
  }
  return shares;
};

export function calculateTotals(input: TotalsInput): Totals {
  const bases = input.lines.map((line) => lineBase(line, input.isPriceIncludeTax));
  const subtotal = sumMinor(bases);

  const requested =
    input.discountType === 'percentage'
      ? percentOf(subtotal, input.discountValue)
      : input.discountType === 'nominal'
        ? toMinor(input.discountValue)
        : 0;
  const discount = Math.min(Math.max(requested, 0), subtotal);
  const shares = shareDiscount(bases, discount);

  const taxAmount = sumMinor(
    input.lines.map((line, index) => percentOf(bases[index] - shares[index], line.taxRate))
  );
  const total = subtotal - discount + taxAmount;

  const taxable = subtotal - discount;
  const withholdingRequested =
    input.withholdingType === 'percentage'
      ? percentOf(taxable, input.withholdingValue)
      : input.withholdingType === 'nominal'
        ? toMinor(input.withholdingValue)
        : 0;
  const withholding = Math.min(Math.max(withholdingRequested, 0), total);

  const toAmount = (minor: number) => Number(fromMinor(minor));
  return {
    subtotal: toAmount(subtotal),
    discountAmount: toAmount(discount),
    taxAmount: toAmount(taxAmount),
    total: toAmount(total),
    withholdingAmount: toAmount(withholding),
    finalAmount: toAmount(total - withholding),
  };
}

/** Quantity still open to receive or bill, never negative. */
export const remainingQty = (ordered: number, done: number): number =>
  Math.max(0, Math.round((ordered - done) * 1e4) / 1e4);
