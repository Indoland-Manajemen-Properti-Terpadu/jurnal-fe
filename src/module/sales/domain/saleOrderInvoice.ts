import type { CreateSaleFormValues } from './sale';
import { dueDateFromTerm, emptySaleForm } from './saleForm';
import type { SaleOrder } from './saleOrder';

/**
 * Starts the invoice form from a confirmed order: the same customer, lines, prices and discount.
 * The customer must stay the one on the order and every line needs a product, which the form's own
 * validation already asks for. The invoice is dated today and, with a term, due that many days on.
 */
export const orderToSaleFormValues = (order: SaleOrder, today: string): CreateSaleFormValues => {
  const base = emptySaleForm(today);
  const days = order.paymentTerm?.days;
  return {
    ...base,
    saleOrder: order.id,
    customer: order.customer?.id ?? '',
    customerRefNumber: order.customerRefNumber,
    paymentTerm: order.paymentTerm?.id ?? '',
    dueDate: typeof days === 'number' ? dueDateFromTerm(today, days) : today,
    isPriceIncludeTax: order.isPriceIncludeTax,
    items: order.items.map((item) => ({
      productId: item.product?.id ?? '',
      description: item.description,
      unit: '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      taxId: item.tax?.id ?? '',
    })),
    discountType: order.discountType ?? base.discountType,
    discountValue: order.discountValue,
    message: order.message,
    memo: order.memo,
  };
};
