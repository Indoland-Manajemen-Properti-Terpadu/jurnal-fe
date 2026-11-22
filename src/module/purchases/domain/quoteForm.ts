import { sumMinor, toMinor } from '@/lib/money/money';
import type { PaymentTermOption } from '@/module/purchases/domain/purchaseCommon';
import type {
  Quote,
  QuoteInput,
  QuoteScores,
  ScoreKey,
  TermOverridesInput,
} from '@/module/purchases/domain/procurement';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';

/** Lengths the service accepts; a longer value is refused with a 400. */
export const QUOTE_LIMITS = {
  number: 100,
  warranty: 100,
  specification: 1000,
} as const;

export const SCORE_KEYS: ScoreKey[] = ['price', 'spec', 'delivery', 'term'];

export interface QuoteFormLine {
  requestItemId: string;
  /** What the line asks for, shown beside its price. */
  label: string;
  quantity: number;
  unitName: string;
  unitPrice: number | '';
  /** Blank means the quoted price stands. */
  finalPrice: number | '';
  specification: string;
  taxId: string;
}

export interface QuoteFormValues {
  /** Set while editing a saved quote. */
  id?: string;
  vendorId: string;
  vendorName: string;
  number: string;
  validUntil: string;
  description: string;
  warranty: string;
  leadDays: number | '';
  paymentTermId: string;
  advancePercent: number | '';
  installments: number | '';
  /** One percent per installment; empty while the split is even or not asked for. */
  installmentPercents: (number | '')[];
  dueDays: number | '';
  periods: number | '';
  retentionPercent: number | '';
  maintenanceMonths: number | '';
  withReceipt: boolean;
  isPriceIncludeTax: boolean;
  discountAmount: number | '';
  shippingAmount: number | '';
  lines: QuoteFormLine[];
  scores: QuoteScores;
}

export type QuoteFormIssue =
  | 'vendorRequired'
  | 'numberTooLong'
  | 'warrantyTooLong'
  | 'leadDaysInvalid'
  | 'termRequired'
  | 'advanceRange'
  | 'installmentsMin'
  | 'percentsSum'
  | 'dueDaysInvalid'
  | 'periodsMin'
  | 'retentionRange'
  | 'maintenanceInvalid'
  | 'discountTooHigh'
  | 'amountNegative'
  | 'filesRequired';

export interface QuoteFormErrors {
  fields: Partial<Record<keyof QuoteFormValues, QuoteFormIssue>>;
  /** By request item id. */
  lines: Record<
    string,
    { unitPrice?: 'priceRequired'; finalPrice?: 'negative'; specification?: 'tooLong' }
  >;
}

/** The smallest number of installments the service accepts. */
export const MIN_INSTALLMENTS = 2;
export const MIN_PERIODS = 2;

const EMPTY_SCORES: QuoteScores = { price: null, spec: null, delivery: null, term: null };

/** An empty form for a new quote; the service lists one line per request item. */
export const emptyQuoteForm = (items: RequestItem[]): QuoteFormValues => ({
  vendorId: '',
  vendorName: '',
  number: '',
  validUntil: '',
  description: '',
  warranty: '',
  leadDays: '',
  paymentTermId: '',
  advancePercent: '',
  installments: '',
  installmentPercents: [],
  dueDays: '',
  periods: '',
  retentionPercent: '',
  maintenanceMonths: '',
  withReceipt: true,
  isPriceIncludeTax: false,
  discountAmount: 0,
  shippingAmount: 0,
  lines: items.map((item) => ({
    requestItemId: item.id,
    label: item.product?.name ?? item.description,
    quantity: item.quantity,
    unitName: item.unit?.name ?? '',
    unitPrice: '',
    finalPrice: '',
    specification: '',
    taxId: '',
  })),
  scores: { ...EMPTY_SCORES },
});

/** A saved quote opened for editing. A line the request has but the quote lacks starts empty. */
export const quoteToForm = (quote: Quote, items: RequestItem[]): QuoteFormValues => {
  const { term } = quote;
  return {
    ...emptyQuoteForm(items),
    id: quote.id,
    vendorId: quote.vendor.id,
    vendorName: quote.vendor.name,
    number: quote.number,
    validUntil: quote.validUntil ?? '',
    description: quote.description,
    warranty: quote.warranty,
    leadDays: quote.leadDays ?? '',
    paymentTermId: quote.paymentTermId,
    advancePercent: term && term.advanceType === 'partial' ? term.advancePercent : '',
    installments: term?.installments ?? '',
    installmentPercents: term ? term.installmentPercents : [],
    dueDays: term?.dueDays ?? '',
    periods: term?.periods ?? '',
    retentionPercent: term && term.hasRetention ? term.retentionPercent : '',
    maintenanceMonths: term && term.hasRetention ? term.maintenanceMonths : '',
    withReceipt: quote.withReceipt,
    isPriceIncludeTax: quote.isPriceIncludeTax,
    discountAmount: quote.discountAmount,
    shippingAmount: quote.shippingAmount,
    lines: items.map((item) => {
      const line = quote.lines.find((candidate) => candidate.requestItemId === item.id);
      return {
        requestItemId: item.id,
        label: item.product?.name ?? item.description,
        quantity: item.quantity,
        unitName: item.unit?.name ?? '',
        unitPrice: line ? line.unitPrice : '',
        finalPrice: line?.finalPrice ?? '',
        specification: line?.specification ?? '',
        taxId: line?.taxId ?? '',
      };
    }),
    scores: { ...quote.scores },
  };
};

/** The default values of a term, applied when the person picks it (an override can follow). */
export const withTermDefaults = (
  values: QuoteFormValues,
  term: PaymentTermOption | undefined
): QuoteFormValues => ({
  ...values,
  paymentTermId: term?.id ?? '',
  advancePercent: term?.advanceType === 'partial' ? (term.defaultAdvancePercent ?? '') : '',
  installments: term?.billingSplit === 'milestone' ? (term.defaultInstallments ?? '') : '',
  installmentPercents: [],
  periods: term?.billingSplit === 'recurring' ? (term.defaultPeriods ?? '') : '',
  dueDays: term?.hasDueTerm ? (term.defaultDueDays ?? '') : '',
  retentionPercent: term?.hasRetention ? (term.defaultRetentionPercent ?? '') : '',
  maintenanceMonths: term?.hasRetention ? (term.defaultMaintenanceMonths ?? '') : '',
});

/** Which override fields the picked term has: the mechanism decides, as on the settings screen. */
export const termFields = (term: PaymentTermOption | undefined) => ({
  advance: term?.advanceType === 'partial',
  installments: term?.billingSplit === 'milestone',
  periods: term?.billingSplit === 'recurring',
  due: Boolean(term?.hasDueTerm),
  retention: Boolean(term?.hasRetention),
});

const isNumber = (value: number | ''): value is number => value !== '' && Number.isFinite(value);

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);

/** A price with more than two decimals is rounded to the cent for this check. */
const safeMinor = (amount: number): number => {
  try {
    return toMinor(amount);
  } catch {
    return Math.round(amount * 100);
  }
};

/**
 * The quoted lines at their prices, in minor units, to catch a discount above what is being bought.
 * An estimate for the check only: the service computes the amounts that count and the screen shows those.
 */
export const linesSubtotalMinor = (lines: QuoteFormLine[]): number =>
  sumMinor(
    lines.map((line) =>
      isNumber(line.unitPrice) ? Math.round(safeMinor(line.unitPrice) * line.quantity) : 0
    )
  );

/** Checks the quote the way the service does, plus what a usable quote needs. */
export const validateQuoteForm = (
  values: QuoteFormValues,
  term: PaymentTermOption | undefined,
  options: { filesMissing: boolean }
): QuoteFormErrors => {
  const fields: QuoteFormErrors['fields'] = {};
  const lines: QuoteFormErrors['lines'] = {};
  const fieldsOfTerm = termFields(term);

  if (!values.vendorId) fields.vendorId = 'vendorRequired';
  if (values.number.trim().length > QUOTE_LIMITS.number) fields.number = 'numberTooLong';
  if (values.warranty.trim().length > QUOTE_LIMITS.warranty) fields.warranty = 'warrantyTooLong';
  if (!isNumber(values.leadDays) || values.leadDays < 0 || !Number.isInteger(values.leadDays)) {
    fields.leadDays = 'leadDaysInvalid';
  }
  if (!values.paymentTermId) fields.paymentTermId = 'termRequired';

  if (fieldsOfTerm.advance) {
    const advance = values.advancePercent;
    if (!isNumber(advance) || advance < 1 || advance > 99) fields.advancePercent = 'advanceRange';
  }
  if (fieldsOfTerm.installments) {
    const { installments } = values;
    if (
      !isNumber(installments) ||
      !Number.isInteger(installments) ||
      installments < MIN_INSTALLMENTS
    ) {
      fields.installments = 'installmentsMin';
    } else if (values.installmentPercents.length > 0) {
      const percents = values.installmentPercents;
      const valid =
        percents.length === installments &&
        percents.every((percent) => isNumber(percent) && percent > 0) &&
        Math.abs(sum(percents as number[]) - 100) < 0.005;
      if (!valid) fields.installmentPercents = 'percentsSum';
    }
  }
  if (fieldsOfTerm.periods) {
    const { periods } = values;
    if (!isNumber(periods) || !Number.isInteger(periods) || periods < MIN_PERIODS) {
      fields.periods = 'periodsMin';
    }
  }
  if (fieldsOfTerm.due) {
    const { dueDays } = values;
    if (!isNumber(dueDays) || dueDays < 0 || !Number.isInteger(dueDays)) {
      fields.dueDays = 'dueDaysInvalid';
    }
  }
  if (fieldsOfTerm.retention) {
    const { retentionPercent, maintenanceMonths } = values;
    if (!isNumber(retentionPercent) || retentionPercent <= 0 || retentionPercent >= 100) {
      fields.retentionPercent = 'retentionRange';
    }
    if (
      !isNumber(maintenanceMonths) ||
      maintenanceMonths < 1 ||
      !Number.isInteger(maintenanceMonths)
    ) {
      fields.maintenanceMonths = 'maintenanceInvalid';
    }
  }

  const discount = isNumber(values.discountAmount) ? values.discountAmount : 0;
  const shipping = isNumber(values.shippingAmount) ? values.shippingAmount : 0;
  if (discount < 0) fields.discountAmount = 'amountNegative';
  else if (safeMinor(discount) > linesSubtotalMinor(values.lines)) {
    fields.discountAmount = 'discountTooHigh';
  }
  if (shipping < 0) fields.shippingAmount = 'amountNegative';

  values.lines.forEach((line) => {
    const row: QuoteFormErrors['lines'][string] = {};
    if (!isNumber(line.unitPrice) || line.unitPrice <= 0) row.unitPrice = 'priceRequired';
    if (isNumber(line.finalPrice) && line.finalPrice < 0) row.finalPrice = 'negative';
    if (line.specification.trim().length > QUOTE_LIMITS.specification) {
      row.specification = 'tooLong';
    }
    if (Object.keys(row).length > 0) lines[line.requestItemId] = row;
  });

  if (options.filesMissing) fields.id = 'filesRequired';
  return { fields, lines };
};

export const hasQuoteErrors = (errors: QuoteFormErrors): boolean =>
  Object.keys(errors.fields).length > 0 || Object.keys(errors.lines).length > 0;

const toOverrides = (
  values: QuoteFormValues,
  term: PaymentTermOption | undefined
): TermOverridesInput => {
  const fields = termFields(term);
  const overrides: TermOverridesInput = {};
  if (fields.advance && isNumber(values.advancePercent)) {
    overrides.advancePercent = values.advancePercent;
  }
  if (fields.installments && isNumber(values.installments)) {
    overrides.installments = values.installments;
    if (values.installmentPercents.length > 0) {
      overrides.installmentPercents = values.installmentPercents as number[];
    }
  }
  if (fields.periods && isNumber(values.periods)) overrides.periods = values.periods;
  if (fields.due && isNumber(values.dueDays)) overrides.dueDays = values.dueDays;
  if (fields.retention) {
    if (isNumber(values.retentionPercent)) overrides.retentionPercent = values.retentionPercent;
    if (isNumber(values.maintenanceMonths)) overrides.maintenanceMonths = values.maintenanceMonths;
  }
  return overrides;
};

const optionalScores = (scores: QuoteScores): QuoteInput['scores'] => {
  const entries = SCORE_KEYS.flatMap((key) => {
    const value = scores[key];
    return value === null ? [] : [[key, value] as const];
  });
  return entries.length > 0 ? Object.fromEntries(entries) : undefined;
};

/** The quote as the service takes it. */
export const toQuoteInput = (
  values: QuoteFormValues,
  term: PaymentTermOption | undefined
): QuoteInput => ({
  ...(values.id ? { id: values.id } : {}),
  vendor: values.vendorId,
  quotationNumber: values.number.trim(),
  validUntil: values.validUntil || null,
  description: values.description.trim(),
  paymentTerm: values.paymentTermId,
  termOverrides: toOverrides(values, term),
  leadDays: Number(values.leadDays),
  warranty: values.warranty.trim(),
  withReceipt: values.withReceipt,
  isPriceIncludeTax: values.isPriceIncludeTax,
  discountAmount: isNumber(values.discountAmount) ? values.discountAmount : 0,
  shippingAmount: isNumber(values.shippingAmount) ? values.shippingAmount : 0,
  lines: values.lines.map((line) => ({
    requestItem: line.requestItemId,
    unitPrice: Number(line.unitPrice),
    finalPrice: isNumber(line.finalPrice) ? line.finalPrice : null,
    specification: line.specification.trim(),
    tax: line.taxId || null,
  })),
  scores: optionalScores(values.scores),
});
