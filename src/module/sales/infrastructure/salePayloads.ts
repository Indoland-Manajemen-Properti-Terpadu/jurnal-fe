import { roundToCents } from '../domain/saleMoney';
import type { CreateSaleFormValues, CreateSalePaymentPayload } from '../domain/sale';

export type SaleSaveMode = 'draft' | 'send' | 'update';

// Nominal amounts are money and are rounded to the cent; percentages are rates and stay as typed.
const discountValuePayload = (values: CreateSaleFormValues): number =>
  values.discountType === 'nominal' ? roundToCents(values.discountValue) : values.discountValue;

const withholdingValuePayload = (values: CreateSaleFormValues): number =>
  values.withholdingType === 'nominal'
    ? roundToCents(values.withholdingValue)
    : values.withholdingValue;

/** Multipart body for create (draft or send) and for updating a draft (no status). */
export const buildSaleFormData = (values: CreateSaleFormValues, mode: SaleSaveMode): FormData => {
  const formData = new FormData();
  formData.append('customer', values.customer);

  if (mode !== 'update') formData.append('status', mode === 'send' ? 'SENT' : 'DRAFT');
  if (mode === 'send') formData.append('sendEmail', 'true');

  if (values.transactionDate) formData.append('transactionDate', values.transactionDate);
  if (values.dueDate) formData.append('dueDate', values.dueDate);
  if (values.billingAddress) formData.append('billingAddress', values.billingAddress);
  if (values.transactionNumber) formData.append('transactionNumber', values.transactionNumber);
  if (values.customerRefNumber) formData.append('customerRefNumber', values.customerRefNumber);
  if (values.paymentTerm) formData.append('paymentTerm', values.paymentTerm);
  formData.append('isPriceIncludeTax', String(values.isPriceIncludeTax));

  values.emails.forEach((email) => {
    if (email.trim()) formData.append('emails[]', email.trim());
  });
  values.tags.forEach((tag) => {
    if (tag.trim()) formData.append('tags[]', tag.trim());
  });

  values.items.forEach((item, index) => {
    formData.append(`items[${index}][product]`, item.productId);
    if (item.description) formData.append(`items[${index}][description]`, item.description);
    formData.append(`items[${index}][quantity]`, String(item.quantity));
    formData.append(`items[${index}][unitPrice]`, String(roundToCents(item.unitPrice)));
    if (item.taxId) formData.append(`items[${index}][tax]`, item.taxId);
  });

  if (values.discountValue > 0) {
    formData.append('discountType', values.discountType);
    formData.append('discountValue', String(discountValuePayload(values)));
  }

  if (values.withholdingAccount && values.withholdingValue > 0) {
    formData.append('withholdingType', values.withholdingType);
    formData.append('withholdingValue', String(withholdingValuePayload(values)));
    formData.append('withholdingAccount', values.withholdingAccount);
  }

  if (values.message) formData.append('message', values.message);
  if (values.memo) formData.append('memo', values.memo);
  (values.attachments ?? []).forEach((file) => formData.append('attachments', file));

  return formData;
};

/** Multipart body for a payment: tags as `tags[]`, files as `attachments`. */
export const buildPaymentFormData = (payload: CreateSalePaymentPayload): FormData => {
  const formData = new FormData();
  formData.append('sale', payload.sale);
  formData.append('depositAccount', payload.depositAccount);
  formData.append('paymentMethod', payload.paymentMethod);
  formData.append('paymentDate', payload.paymentDate);
  const amount = typeof payload.amount === 'number' ? roundToCents(payload.amount) : payload.amount;
  formData.append('amount', String(amount));
  if (payload.memo) formData.append('memo', payload.memo);
  (payload.items ?? []).forEach((item, index) => {
    formData.append(`items[${index}][saleItem]`, item.saleItem);
    formData.append(`items[${index}][amount]`, String(roundToCents(item.amount)));
  });
  if (payload.items && payload.lateFeeAmount !== undefined) {
    formData.append('lateFeeAmount', String(roundToCents(payload.lateFeeAmount)));
  }
  if (payload.autoAllocate) formData.append('autoAllocate', 'true');
  (payload.tags ?? []).forEach((tag) => formData.append('tags[]', tag));
  (payload.attachments ?? []).forEach((file) => formData.append('attachments', file));
  return formData;
};
