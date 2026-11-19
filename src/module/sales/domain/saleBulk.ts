/** The API takes between 1 and 200 customers in one run. */
export const BULK_MAX_CUSTOMERS = 200;

export interface BulkRecurringValues {
  product: string;
  /** `YYYY-MM`, the month being billed. */
  period: string;
  transactionDate: string;
  dueDate: string;
  unitPrice: number;
  customers: string[];
}

export type BulkRowStatus = 'created' | 'skipped' | 'failed';

export interface BulkRow {
  customer: string;
  name: string;
  status: BulkRowStatus;
  /** The draft invoice that was made; only on `created`. */
  saleId: string | null;
  transactionNumber: string | null;
  /** Why a customer was skipped or failed. */
  message: string;
}

export interface BulkOutcome {
  created: number;
  skipped: number;
  failed: number;
  rows: BulkRow[];
}

export const emptyBulkForm = (today: string): BulkRecurringValues => ({
  product: '',
  period: today.slice(0, 7),
  transactionDate: today,
  dueDate: today,
  unitPrice: 0,
  customers: [],
});

/** Errors by field; each value is an i18n key under `salesBulk`. */
export const validateBulk = (values: BulkRecurringValues): Record<string, string> => {
  const errors: Record<string, string> = {};
  if (!values.product) errors.product = 'validation.productRequired';
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(values.period)) errors.period = 'validation.periodRequired';
  if (!values.transactionDate) errors.transactionDate = 'validation.dateRequired';
  if (!values.dueDate) errors.dueDate = 'validation.dueRequired';
  else if (values.transactionDate && values.dueDate < values.transactionDate) {
    errors.dueDate = 'validation.dueBeforeDate';
  }
  if (!(values.unitPrice >= 0)) errors.unitPrice = 'validation.priceNegative';
  if (values.customers.length === 0) errors.customers = 'validation.customersRequired';
  else if (values.customers.length > BULK_MAX_CUSTOMERS) {
    errors.customers = 'validation.customersTooMany';
  }
  return errors;
};
