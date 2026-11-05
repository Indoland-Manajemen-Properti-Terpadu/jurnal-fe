import type { CreateSaleFormValues, CreateSaleItemForm, Sale } from './sale';

export type SaleStepId = 'general' | 'lines' | 'extras';
export const SALE_STEPS: SaleStepId[] = ['general', 'lines', 'extras'];

/** Errors by field path; each value is an i18n key under `sales`. */
export type StepErrors = Record<string, string>;

export const emptyLine = (): CreateSaleItemForm => ({
  productId: '',
  description: '',
  unit: '',
  quantity: 1,
  unitPrice: 0,
  taxId: '',
});

export const emptySaleForm = (today: string): CreateSaleFormValues => ({
  customer: '',
  emails: [],
  transactionDate: today,
  dueDate: today,
  billingAddress: '',
  transactionNumber: '',
  tags: [],
  customerRefNumber: '',
  paymentTerm: '',
  isPriceIncludeTax: false,
  items: [emptyLine()],
  discountType: 'percentage',
  discountValue: 0,
  withholdingType: 'nominal',
  withholdingValue: 0,
  withholdingAccount: '',
  message: '',
  memo: '',
});

/** Calendar-day arithmetic in UTC so a time zone never shifts the date. */
export const dueDateFromTerm = (transactionDate: string, days: number): string => {
  const [year, month, day] = transactionDate.split('-').map(Number);
  const due = new Date(Date.UTC(year, month - 1, day + (days || 0)));
  return due.toISOString().slice(0, 10);
};

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateGeneral = (values: CreateSaleFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (!values.customer) errors.customer = 'validation.customerRequired';
  if (!values.transactionDate) errors.transactionDate = 'validation.transactionDateRequired';
  if (!values.dueDate) errors.dueDate = 'validation.dueDateRequired';
  else if (values.transactionDate && values.dueDate < values.transactionDate) {
    errors.dueDate = 'validation.dueBeforeDate';
  }
  if (values.emails.some((email) => email.trim() && !EMAIL.test(email.trim()))) {
    errors.emails = 'validation.emailInvalid';
  }
  return errors;
};

const validateLines = (values: CreateSaleFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (values.items.length === 0) errors.lines = 'validation.linesRequired';
  values.items.forEach((item, index) => {
    if (!item.productId) errors[`items.${index}.productId`] = 'validation.productRequired';
    if (!(item.quantity > 0)) errors[`items.${index}.quantity`] = 'validation.quantityMin';
    if (item.unitPrice < 0) errors[`items.${index}.unitPrice`] = 'validation.priceNegative';
  });
  return errors;
};

const validateExtras = (values: CreateSaleFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (values.discountValue < 0) errors.discountValue = 'validation.discountNegative';
  if (values.discountType === 'percentage' && values.discountValue > 100) {
    errors.discountValue = 'validation.discountPercent';
  }
  if (values.withholdingValue > 0 && !values.withholdingAccount) {
    errors.withholdingAccount = 'validation.withholdingAccountRequired';
  }
  return errors;
};

export const validateStep = (step: SaleStepId, values: CreateSaleFormValues): StepErrors => {
  if (step === 'general') return validateGeneral(values);
  if (step === 'lines') return validateLines(values);
  return validateExtras(values);
};

/** A draft only needs a customer and one usable line; the rest can be finished later. */
export const canSaveDraft = (values: CreateSaleFormValues): boolean =>
  Boolean(values.customer) &&
  values.items.some((item) => Boolean(item.productId) && item.quantity > 0);

/** Sending issues the invoice, so every step must be valid. */
export const canSend = (values: CreateSaleFormValues): boolean =>
  SALE_STEPS.every((step) => Object.keys(validateStep(step, values)).length === 0);

const day = (iso: string | null | undefined): string => (iso ? iso.slice(0, 10) : '');

/** Form values of a stored invoice, for editing a draft. Files already attached stay as they are. */
export const saleToFormValues = (sale: Sale): CreateSaleFormValues => ({
  customer: sale.customer?.id ?? '',
  emails: sale.emails ?? [],
  transactionDate: day(sale.transactionDate),
  dueDate: day(sale.dueDate),
  billingAddress: sale.billingAddress ?? '',
  transactionNumber: sale.transactionNumber ?? '',
  tags: (sale.tags ?? []).map((tag) => tag.id),
  customerRefNumber: sale.customerRefNumber ?? '',
  paymentTerm: sale.paymentTerm?.id ?? '',
  isPriceIncludeTax: sale.isPriceIncludeTax,
  items: (sale.items ?? []).map((item) => ({
    productId: item.product?.id ?? '',
    description: item.description ?? '',
    unit: item.unit ?? '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxId: item.tax?.id ?? '',
  })),
  discountType: sale.discountType ?? 'percentage',
  discountValue: sale.discountValue ?? 0,
  withholdingType: sale.withholdingType ?? 'nominal',
  withholdingValue: sale.withholdingValue ?? 0,
  withholdingAccount: sale.withholdingAccount?.id ?? '',
  message: sale.message ?? '',
  memo: sale.memo ?? '',
});
