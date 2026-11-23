import { sumMinor } from '@/lib/money/money';
import { isNumber, safeMinor, type QuoteFormValues } from '@/module/purchases/domain/quoteForm';

export interface QuoteEstimate {
  subtotal: number;
  discount: number;
  tax: number;
  shipping: number;
  total: number;
}

/**
 * What the quote comes to, in minor units, while it is being typed: the items, the discount off
 * them (spread over the lines so each is taxed on what is left), the tax at each line's rate, and
 * the shipping. Prices that include tax carry the tax already. The service computes the amounts
 * that count once the quote is saved; this is only the figure shown beside the form.
 */
export const estimateQuote = (
  values: QuoteFormValues,
  rates: Record<string, number>
): QuoteEstimate => {
  const gross = values.lines.map((line) =>
    isNumber(line.unitPrice) ? Math.round(safeMinor(line.unitPrice) * line.quantity) : 0
  );
  const subtotal = sumMinor(gross);
  const entered = isNumber(values.discountValue) ? values.discountValue : 0;
  const discount =
    values.discountType === 'percentage'
      ? Math.round((subtotal * entered) / 100)
      : safeMinor(entered);
  const shipping = isNumber(values.shippingAmount) ? safeMinor(values.shippingAmount) : 0;
  let tax = 0;
  values.lines.forEach((line, index) => {
    const share = subtotal > 0 ? (discount * gross[index]) / subtotal : 0;
    const net = gross[index] - share;
    const rate = (line.taxId ? rates[line.taxId] : 0) ?? 0;
    tax += values.isPriceIncludeTax ? net - net / (1 + rate / 100) : (net * rate) / 100;
  });
  const taxMinor = Math.round(tax);
  const base = subtotal - discount;
  return {
    subtotal,
    discount,
    tax: taxMinor,
    shipping,
    total: (values.isPriceIncludeTax ? base : base + taxMinor) + shipping,
  };
};
