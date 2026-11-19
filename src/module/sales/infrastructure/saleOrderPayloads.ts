import { roundToCents } from '../domain/saleMoney';
import type { OrderFormValues } from '../domain/saleOrderForm';

/** JSON body for creating an order or editing one; an edit sends every field. */
export const buildOrderBody = (values: OrderFormValues, mode: 'create' | 'update') => ({
  customer: values.customer,
  transactionDate: values.transactionDate,
  targetDate: values.targetDate || null,
  ...(values.transactionNumber ? { transactionNumber: values.transactionNumber } : {}),
  deliveryAddress: values.deliveryAddress,
  ...(mode === 'update' || values.paymentTerm ? { paymentTerm: values.paymentTerm } : {}),
  unitTower: values.unitTower,
  customerRefNumber: values.customerRefNumber,
  isPriceIncludeTax: values.isPriceIncludeTax,
  discountType: values.discountType,
  // A nominal discount is money, a percentage is a rate and stays as typed.
  discountValue:
    values.discountType === 'nominal' ? roundToCents(values.discountValue) : values.discountValue,
  terms: values.terms,
  message: values.message,
  memo: values.memo,
  items: values.items.map((item) => ({
    product: item.productId,
    description: item.description,
    quantity: item.quantity,
    unitPrice: roundToCents(item.unitPrice),
    ...(item.taxId ? { tax: item.taxId } : {}),
  })),
});
