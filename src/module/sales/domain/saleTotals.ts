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
// The server's rule (changed 2026-11-11, verified live): the discount is spread over the lines in
// proportion to their amount, each line's VAT is taken on its amount after its share of the
// discount, and withholding (PPh) is a share of the subtotal after the discount.
//   total = subtotal - discount + VAT      final = total - withholding
// With tax-inclusive prices each line is first reduced to its price without tax and then follows
// the same rule.
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

/**
 * Splits a discount over the lines in proportion to their amounts, to the cent. The cents left
 * after rounding down go to the lines with the largest fractions, the first line on a tie, so the
 * shares always add up to the discount (the same split the server makes).
 */
const spreadDiscount = (amounts: number[], discount: number): number[] => {
  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  if (discount <= 0 || total <= 0) return amounts.map(() => 0);
  const big = amounts.map((amount) => BigInt(amount) * BigInt(discount));
  const divisor = BigInt(total);
  const shares = big.map((product) => Number(product / divisor));
  const remainders = big.map((product) => product % divisor);
  let left = discount - shares.reduce((sum, share) => sum + share, 0);
  const order = remainders
    .map((remainder, index) => ({ remainder, index }))
    .sort((a, b) =>
      a.remainder === b.remainder ? a.index - b.index : a.remainder > b.remainder ? -1 : 1
    );
  for (let k = 0; left > 0 && k < order.length; k += 1, left -= 1) {
    shares[order[k].index] += 1;
  }
  return shares;
};

export const calculateSaleTotals = (input: SaleTotalsInput): SaleTotals => {
  const gross = input.lines.map(lineSubtotalCents);
  // Prices that include tax are brought down to the price without tax first.
  const amounts = input.isPriceIncludeTax
    ? gross.map((amount, index) =>
        roundMinor(amount / (1 + (input.lines[index].taxRate || 0) / 100))
      )
    : gross;
  const subtotal = sumMinor(amounts);
  // A discount can never exceed the amount it applies to.
  const discount = Math.min(
    adjustmentCents(input.discountType, input.discountValue, subtotal),
    subtotal
  );
  const shares = spreadDiscount(amounts, discount);
  const tax = sumMinor(
    amounts.map((amount, index) =>
      roundMinor(((amount - shares[index]) * (input.lines[index].taxRate || 0)) / 100)
    )
  );
  const withholding = adjustmentCents(
    input.withholdingType,
    input.withholdingValue,
    subtotal - discount
  );
  const total = subtotal - discount + tax;

  return {
    subtotal: fromCents(subtotal),
    discountAmount: fromCents(discount),
    taxTotal: fromCents(tax),
    total: fromCents(total),
    withholdingAmount: fromCents(withholding),
    finalAmount: fromCents(total - withholding),
  };
};

/** Amount still open after a (possibly partial) payment, in currency units. */
export const remainingAfterPayment = (remainingAmount: number, paymentAmount: number): number =>
  fromCents(toCents(remainingAmount) - toCents(paymentAmount));
