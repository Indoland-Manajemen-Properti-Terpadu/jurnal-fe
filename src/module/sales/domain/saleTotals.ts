import { sumMinor } from '@/lib/money/money';
import type { DiscountType, WithholdingType } from './sale';
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
  /** The unit price already contains the line's tax (the tax is split out, not added). */
  isPriceIncludeTax?: boolean;
}

export interface SaleTotals {
  subtotal: number;
  discountAmount: number;
  taxTotal: number;
  total: number;
  withholdingAmount: number;
  finalAmount: number;
}

// Unit price and nominal values are rounded to the cent once, then everything is integer cents.
// Line subtotal is rounded half up per line. The server charges VAT (PPN) on each line's full price,
// so an invoice discount never lowers the tax, and withholding (PPh) is a share of the subtotal
// before the discount. Both were verified against the live service (see the module README).
const lineSubtotalCents = ({ quantity, unitPrice }: SaleLineInput) =>
  roundMinor((quantity || 0) * toCents(unitPrice || 0));

/** Amount of one line (quantity times unit price) in currency units, rounded to the cent. */
export const lineAmount = (quantity: number, unitPrice: number): number =>
  fromCents(lineSubtotalCents({ quantity, unitPrice, taxRate: 0 }));

const adjustmentCents = (type: 'percentage' | 'nominal', value: number, base: number) => {
  if (!(value > 0)) {
    return 0;
  }
  return type === 'percentage' ? roundMinor((base * value) / 100) : toCents(value);
};

const inclusiveTotals = (input: SaleTotalsInput): SaleTotals => {
  const gross = input.lines.map(lineSubtotalCents);
  const nets = gross.map((amount, index) =>
    roundMinor(amount / (1 + (input.lines[index].taxRate || 0) / 100))
  );
  const subtotal = sumMinor(nets);
  const grossTotal = sumMinor(gross);
  const tax = grossTotal - subtotal;
  // The server takes the discount off the tax-included amount, so the tax stays inside the total.
  const discount = Math.min(
    adjustmentCents(input.discountType, input.discountValue, grossTotal),
    grossTotal
  );
  const total = grossTotal - discount;
  // Withholding (PPh) is taken on the amount without tax, as the server does.
  const withholding = adjustmentCents(input.withholdingType, input.withholdingValue, subtotal);

  return {
    subtotal: fromCents(subtotal),
    discountAmount: fromCents(discount),
    taxTotal: fromCents(tax),
    total: fromCents(total),
    withholdingAmount: fromCents(withholding),
    finalAmount: fromCents(Math.max(0, total - withholding)),
  };
};

export const calculateSaleTotals = (input: SaleTotalsInput): SaleTotals => {
  if (input.isPriceIncludeTax) return inclusiveTotals(input);
  const subtotals = input.lines.map(lineSubtotalCents);
  const subtotal = sumMinor(subtotals);
  // A discount can never exceed the amount it applies to.
  const discount = Math.min(
    adjustmentCents(input.discountType, input.discountValue, subtotal),
    subtotal
  );
  const tax = sumMinor(
    input.lines.map((line, index) => roundMinor((subtotals[index] * (line.taxRate || 0)) / 100))
  );
  const withholding = adjustmentCents(input.withholdingType, input.withholdingValue, subtotal);
  const total = subtotal - discount + tax;

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
