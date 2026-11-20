import type { CreateSaleFormValues } from './sale';
import { dueDateFromTerm, emptySaleForm } from './saleForm';
import { fromCents, toCents } from './saleMoney';
import type { SaleOrder } from './saleOrder';

/** What is still to bill on a line; a server that sends no figure bills the whole line. */
const leftOn = (item: SaleOrder['items'][number]): number => item.remainingQty ?? item.quantity;

/**
 * Starts the invoice form from a confirmed or partly invoiced order: the same customer, prices and
 * discount, and for each line what is left to bill (a line that is fully invoiced is skipped). Each
 * line names its order line so the server bills part of it, and cannot go above what is left. A
 * nominal discount is cut to the share of the order that is billed. The customer must stay the one
 * on the order and every line needs a product, which the form's own validation already asks for.
 * The invoice is dated today and, with a term, due that many days on.
 */
export const orderToSaleFormValues = (order: SaleOrder, today: string): CreateSaleFormValues => {
  const base = emptySaleForm(today);
  const days = order.paymentTerm?.days;
  const lines = order.items.filter((item) => leftOn(item) > 0);

  const worth = (items: typeof lines, quantityOf: (item: (typeof lines)[number]) => number) =>
    items.reduce((sum, item) => sum + toCents(quantityOf(item) * item.unitPrice), 0);
  const ordered = worth(order.items, (item) => item.quantity);
  const billed = worth(lines, leftOn);
  const discountType = order.discountType ?? base.discountType;
  const discountValue =
    discountType === 'nominal' && ordered > 0 && billed < ordered
      ? fromCents(Math.round((toCents(order.discountValue) * billed) / ordered))
      : order.discountValue;

  return {
    ...base,
    saleOrder: order.id,
    customer: order.customer?.id ?? '',
    customerRefNumber: order.customerRefNumber,
    paymentTerm: order.paymentTerm?.id ?? '',
    dueDate: typeof days === 'number' ? dueDateFromTerm(today, days) : today,
    isPriceIncludeTax: order.isPriceIncludeTax,
    items: lines.map((item) => ({
      productId: item.product?.id ?? '',
      description: item.description,
      unit: '',
      quantity: leftOn(item),
      unitPrice: item.unitPrice,
      taxId: item.tax?.id ?? '',
      saleOrderItem: item.id || undefined,
      maxQuantity: item.remainingQty,
    })),
    discountType,
    discountValue,
    message: order.message,
    memo: order.memo,
  };
};
