import { roundToCents } from '../domain/saleMoney';
import type { QuoteFormValues } from '../domain/saleQuoteForm';

/**
 * JSON body for creating a quote or editing a draft. An edit sends every field: the API leaves
 * out-of-body fields alone, and an empty `paymentTerm` is how a term is cleared.
 */
export const buildQuoteBody = (values: QuoteFormValues, mode: 'create' | 'update') => ({
  customer: values.customer,
  transactionDate: values.transactionDate,
  validUntil: values.validUntil,
  ...(values.transactionNumber ? { transactionNumber: values.transactionNumber } : {}),
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

export interface SendQuoteInput {
  /** Up to 10 addresses; none means the quote is only marked as sent. */
  emails: string[];
  message: string;
}

export const buildSendBody = ({ emails, message }: SendQuoteInput) =>
  emails.length ? { emails, ...(message.trim() ? { message: message.trim() } : {}) } : {};
