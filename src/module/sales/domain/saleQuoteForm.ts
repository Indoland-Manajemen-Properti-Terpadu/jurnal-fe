import type { CreateSaleItemForm, DiscountType } from './sale';
import { dueDateFromTerm, emptyLine, type StepErrors } from './saleForm';
import type { SaleQuote } from './saleQuote';

export type QuoteStepId = 'general' | 'lines' | 'extras';
export const QUOTE_STEPS: QuoteStepId[] = ['general', 'lines', 'extras'];

export interface QuoteFormValues {
  customer: string;
  transactionNumber: string;
  transactionDate: string;
  validUntil: string;
  paymentTerm: string;
  unitTower: string;
  customerRefNumber: string;
  isPriceIncludeTax: boolean;
  items: CreateSaleItemForm[];
  discountType: DiscountType;
  discountValue: number;
  terms: string;
  message: string;
  memo: string;
}

/** A quote is open for two weeks unless the user picks another day. */
export const DEFAULT_QUOTE_DAYS = 14;

export const emptyQuoteForm = (today: string): QuoteFormValues => ({
  customer: '',
  transactionNumber: '',
  transactionDate: today,
  validUntil: dueDateFromTerm(today, DEFAULT_QUOTE_DAYS),
  paymentTerm: '',
  unitTower: '',
  customerRefNumber: '',
  isPriceIncludeTax: false,
  items: [emptyLine()],
  discountType: 'percentage',
  discountValue: 0,
  terms: '',
  message: '',
  memo: '',
});

const validateGeneral = (values: QuoteFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (!values.customer) errors.customer = 'validation.customerRequired';
  if (!values.transactionDate) errors.transactionDate = 'validation.transactionDateRequired';
  if (!values.validUntil) errors.validUntil = 'validation.validUntilRequired';
  else if (values.transactionDate && values.validUntil < values.transactionDate) {
    errors.validUntil = 'validation.validUntilBeforeDate';
  }
  return errors;
};

const validateLines = (values: QuoteFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (values.items.length === 0) errors.lines = 'validation.linesRequired';
  values.items.forEach((item, index) => {
    if (!item.productId) errors[`items.${index}.productId`] = 'validation.productRequired';
    if (!(item.quantity > 0)) errors[`items.${index}.quantity`] = 'validation.quantityMin';
    if (item.unitPrice < 0) errors[`items.${index}.unitPrice`] = 'validation.priceNegative';
  });
  return errors;
};

const validateExtras = (values: QuoteFormValues): StepErrors => {
  const errors: StepErrors = {};
  if (values.discountValue < 0) errors.discountValue = 'validation.discountNegative';
  if (values.discountType === 'percentage' && values.discountValue > 100) {
    errors.discountValue = 'validation.discountPercent';
  }
  return errors;
};

export const validateQuoteStep = (step: QuoteStepId, values: QuoteFormValues): StepErrors => {
  if (step === 'general') return validateGeneral(values);
  if (step === 'lines') return validateLines(values);
  return validateExtras(values);
};

/** A quote has no journal, so a draft only needs what the API requires: customer, dates, a line. */
export const canSaveQuote = (values: QuoteFormValues): boolean =>
  QUOTE_STEPS.every((step) => Object.keys(validateQuoteStep(step, values)).length === 0);

const day = (iso: string | null | undefined): string => (iso ? iso.slice(0, 10) : '');

/** Form values of a stored quote, for editing a draft. */
export const quoteToFormValues = (quote: SaleQuote): QuoteFormValues => ({
  customer: quote.customer?.id ?? '',
  transactionNumber: quote.transactionNumber,
  transactionDate: day(quote.transactionDate),
  validUntil: day(quote.validUntil),
  paymentTerm: quote.paymentTerm?.id ?? '',
  unitTower: quote.unitTower,
  customerRefNumber: quote.customerRefNumber,
  isPriceIncludeTax: quote.isPriceIncludeTax,
  items: quote.items.map((item) => ({
    productId: item.product?.id ?? '',
    description: item.description,
    unit: '',
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    taxId: item.tax?.id ?? '',
  })),
  discountType: quote.discountType ?? 'percentage',
  discountValue: quote.discountValue,
  terms: quote.terms,
  message: quote.message,
  memo: quote.memo,
});
