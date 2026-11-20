export type PaymentTermAppliesTo = 'goods' | 'service' | 'both';
export type PaymentTermAdvanceType = 'none' | 'partial' | 'full';
export type PaymentTermBillingSplit = 'single' | 'milestone' | 'recurring';
export type PaymentTermPeriodUnit = 'monthly' | 'quarterly' | 'semiannual' | 'yearly';
export type PaymentTermDueBasis = 'receipt_date' | 'vendor_invoice_date';

/** A payment term as the API returns it. `summary` holds the ready-made labels of the term. */
export type PaymentTerm = {
  id: string;
  name: string;
  appliesTo: PaymentTermAppliesTo;
  description: string;
  usageExample: string;
  advanceType: PaymentTermAdvanceType;
  defaultAdvancePercent: number | null;
  billingSplit: PaymentTermBillingSplit;
  defaultInstallments: number | null;
  advanceOutsideInstallments: boolean;
  periodUnit: PaymentTermPeriodUnit | null;
  defaultPeriods: number | null;
  hasDueTerm: boolean;
  defaultDueDays: number | null;
  dueBasis: PaymentTermDueBasis;
  hasRetention: boolean;
  defaultRetentionPercent: number | null;
  defaultMaintenanceMonths: number | null;
  isActive: boolean;
  isDefault: boolean;
  summary: { paymentLabel: string; billingLabel: string; dueLabel: string };
  usageCount: number;
  usageBreakdown: { purchase: number; sale: number };
  canDelete: boolean;
};

/** What a person fills in. A number field is `''` while empty. */
export type PaymentTermFormValues = {
  name: string;
  appliesTo: PaymentTermAppliesTo;
  description: string;
  usageExample: string;
  advanceType: PaymentTermAdvanceType;
  advancePercent: number | '';
  billingSplit: PaymentTermBillingSplit;
  installments: number | '';
  advanceOutsideInstallments: boolean;
  periodUnit: PaymentTermPeriodUnit;
  periods: number | '';
  hasDueTerm: boolean;
  dueDays: number | '';
  dueBasis: PaymentTermDueBasis;
  hasRetention: boolean;
  retentionPercent: number | '';
  maintenanceMonths: number | '';
};

/** Body of create and update. A field that does not apply to the chosen mechanism is left out. */
export type PaymentTermPayload = {
  name: string;
  appliesTo: PaymentTermAppliesTo;
  description?: string;
  usageExample?: string;
  advanceType: PaymentTermAdvanceType;
  defaultAdvancePercent?: number;
  billingSplit: PaymentTermBillingSplit;
  defaultInstallments?: number;
  advanceOutsideInstallments?: boolean;
  periodUnit?: PaymentTermPeriodUnit;
  defaultPeriods?: number;
  hasDueTerm: boolean;
  defaultDueDays?: number;
  dueBasis?: PaymentTermDueBasis;
  hasRetention: boolean;
  defaultRetentionPercent?: number;
  defaultMaintenanceMonths?: number;
};

export const DEFAULT_PAYMENT_TERM_FORM: PaymentTermFormValues = {
  name: '',
  appliesTo: 'both',
  description: '',
  usageExample: '',
  advanceType: 'none',
  advancePercent: '',
  billingSplit: 'single',
  installments: '',
  advanceOutsideInstallments: false,
  periodUnit: 'monthly',
  periods: '',
  hasDueTerm: true,
  dueDays: 30,
  dueBasis: 'vendor_invoice_date',
  hasRetention: false,
  retentionPercent: '',
  maintenanceMonths: '',
};

export type PaymentTermVisibleFields = {
  advancePercent: boolean;
  installments: boolean;
  advanceOutsideInstallments: boolean;
  retention: boolean;
  retentionDetails: boolean;
  period: boolean;
  due: boolean;
};

/** Which fields apply to the mechanism chosen in the form. The form and the payload both follow this. */
export const visiblePaymentTermFields = (
  values: PaymentTermFormValues
): PaymentTermVisibleFields => {
  const milestone = values.billingSplit === 'milestone';
  return {
    advancePercent: values.advanceType === 'partial',
    installments: milestone,
    advanceOutsideInstallments: milestone && values.advanceType === 'partial',
    retention: milestone,
    retentionDetails: milestone && values.hasRetention,
    period: values.billingSplit === 'recurring',
    due: values.hasDueTerm,
  };
};

/** Keys of the `settings` namespace (`validation.*`). */
export type PaymentTermValidationKey =
  | 'validation.paymentTermNameRequired'
  | 'validation.advancePercentRange'
  | 'validation.installmentsMin'
  | 'validation.periodsMin'
  | 'validation.paymentTermDaysMin'
  | 'validation.retentionPercentRequired'
  | 'validation.maintenanceMonthsMin';

export type PaymentTermFormErrors = Partial<
  Record<
    | 'name'
    | 'advancePercent'
    | 'installments'
    | 'periods'
    | 'dueDays'
    | 'retentionPercent'
    | 'maintenanceMonths',
    PaymentTermValidationKey
  >
>;

const isNumber = (value: number | ''): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Same rules as the API: only the fields that apply are checked. */
export const validatePaymentTermForm = (values: PaymentTermFormValues): PaymentTermFormErrors => {
  const visible = visiblePaymentTermFields(values);
  const errors: PaymentTermFormErrors = {};

  if (!values.name.trim()) errors.name = 'validation.paymentTermNameRequired';
  if (
    visible.advancePercent &&
    !(isNumber(values.advancePercent) && values.advancePercent >= 1 && values.advancePercent <= 99)
  ) {
    errors.advancePercent = 'validation.advancePercentRange';
  }
  if (visible.installments && !(isNumber(values.installments) && values.installments >= 2)) {
    errors.installments = 'validation.installmentsMin';
  }
  if (visible.period && !(isNumber(values.periods) && values.periods >= 2)) {
    errors.periods = 'validation.periodsMin';
  }
  if (visible.due && !(isNumber(values.dueDays) && values.dueDays >= 0)) {
    errors.dueDays = 'validation.paymentTermDaysMin';
  }
  if (visible.retentionDetails) {
    if (!(isNumber(values.retentionPercent) && values.retentionPercent > 0)) {
      errors.retentionPercent = 'validation.retentionPercentRequired';
    }
    if (!(isNumber(values.maintenanceMonths) && values.maintenanceMonths >= 1)) {
      errors.maintenanceMonths = 'validation.maintenanceMonthsMin';
    }
  }
  return errors;
};

/** Build the request body. Call it with values that passed `validatePaymentTermForm`. */
export const toPaymentTermPayload = (values: PaymentTermFormValues): PaymentTermPayload => {
  const visible = visiblePaymentTermFields(values);
  const description = values.description.trim();
  const usageExample = values.usageExample.trim();
  const payload: PaymentTermPayload = {
    name: values.name.trim(),
    appliesTo: values.appliesTo,
    advanceType: values.advanceType,
    billingSplit: values.billingSplit,
    hasDueTerm: values.hasDueTerm,
    hasRetention: visible.retention && values.hasRetention,
  };

  if (description) payload.description = description;
  if (usageExample) payload.usageExample = usageExample;
  if (visible.advancePercent && isNumber(values.advancePercent)) {
    payload.defaultAdvancePercent = values.advancePercent;
  }
  if (visible.installments && isNumber(values.installments)) {
    payload.defaultInstallments = values.installments;
  }
  if (visible.advanceOutsideInstallments) {
    payload.advanceOutsideInstallments = values.advanceOutsideInstallments;
  }
  if (visible.period) {
    payload.periodUnit = values.periodUnit;
    if (isNumber(values.periods)) payload.defaultPeriods = values.periods;
  }
  if (visible.due) {
    payload.dueBasis = values.dueBasis;
    if (isNumber(values.dueDays)) payload.defaultDueDays = values.dueDays;
  }
  if (visible.retentionDetails) {
    if (isNumber(values.retentionPercent)) {
      payload.defaultRetentionPercent = values.retentionPercent;
    }
    if (isNumber(values.maintenanceMonths)) {
      payload.defaultMaintenanceMonths = values.maintenanceMonths;
    }
  }
  return payload;
};

/** Fill the form from a saved term (edit page). */
export const toPaymentTermFormValues = (term: PaymentTerm): PaymentTermFormValues => ({
  name: term.name,
  appliesTo: term.appliesTo,
  description: term.description ?? '',
  usageExample: term.usageExample ?? '',
  advanceType: term.advanceType,
  advancePercent: term.advanceType === 'partial' ? (term.defaultAdvancePercent ?? '') : '',
  billingSplit: term.billingSplit,
  installments: term.defaultInstallments ?? '',
  advanceOutsideInstallments: term.advanceOutsideInstallments,
  periodUnit: term.periodUnit ?? DEFAULT_PAYMENT_TERM_FORM.periodUnit,
  periods: term.defaultPeriods ?? '',
  hasDueTerm: term.hasDueTerm,
  dueDays: term.defaultDueDays ?? DEFAULT_PAYMENT_TERM_FORM.dueDays,
  dueBasis: term.dueBasis,
  hasRetention: term.hasRetention,
  retentionPercent: term.defaultRetentionPercent ?? '',
  maintenanceMonths: term.defaultMaintenanceMonths ?? '',
});

/**
 * The due-date line of a term, built from its own fields so that it never calls the invoice a
 * "vendor invoice": a term is used on sales invoices too. Null when the term has no due days and the
 * server's own label should be shown.
 */
export const dueTextOf = (
  term: Pick<PaymentTerm, 'hasDueTerm' | 'defaultDueDays' | 'dueBasis'>
): { key: 'dueFromInvoice' | 'dueFromReceipt'; days: number } | null => {
  if (!term.hasDueTerm || term.defaultDueDays == null) return null;
  return {
    key: term.dueBasis === 'receipt_date' ? 'dueFromReceipt' : 'dueFromInvoice',
    days: term.defaultDueDays,
  };
};
