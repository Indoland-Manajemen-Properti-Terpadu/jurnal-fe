import type {
  PaymentTerm,
  PaymentTermAdvanceType,
  PaymentTermAppliesTo,
  PaymentTermBillingSplit,
  PaymentTermDueBasis,
  PaymentTermPeriodUnit,
} from '../domain/paymentTerm';

type Pagination = { total: number; page: number; limit: number; totalPages: number };

export type PaymentTermPage = { items: PaymentTerm[]; pagination: Pagination };

/** What the API sends. Enums arrive as plain strings and some fields can be missing or null. */
export type PaymentTermDto = {
  id: string;
  name: string;
  appliesTo?: string | null;
  description?: string | null;
  usageExample?: string | null;
  advanceType?: string | null;
  defaultAdvancePercent?: number | null;
  billingSplit?: string | null;
  defaultInstallments?: number | null;
  advanceOutsideInstallments?: boolean | null;
  periodUnit?: string | null;
  defaultPeriods?: number | null;
  hasDueTerm?: boolean | null;
  defaultDueDays?: number | null;
  dueBasis?: string | null;
  hasRetention?: boolean | null;
  defaultRetentionPercent?: number | null;
  defaultMaintenanceMonths?: number | null;
  isActive?: boolean | null;
  isDefault?: boolean | null;
  summary?: Partial<PaymentTerm['summary']> | null;
  usageCount?: number | null;
  usageBreakdown?: Partial<PaymentTerm['usageBreakdown']> | null;
  canDelete?: boolean | null;
};

export type PaymentTermListDto =
  | { data?: PaymentTermDto[]; pagination?: Partial<Pagination> | null }
  | PaymentTermDto[]
  | null
  | undefined;

const oneOf = <T extends string>(
  value: string | null | undefined,
  allowed: readonly T[],
  fallback: T
): T => (allowed.includes(value as T) ? (value as T) : fallback);

const APPLIES_TO = ['goods', 'service', 'both'] as const satisfies readonly PaymentTermAppliesTo[];
const ADVANCE_TYPES = [
  'none',
  'partial',
  'full',
] as const satisfies readonly PaymentTermAdvanceType[];
const BILLING_SPLITS = [
  'single',
  'milestone',
  'recurring',
] as const satisfies readonly PaymentTermBillingSplit[];
const PERIOD_UNITS = [
  'monthly',
  'quarterly',
  'semiannual',
  'yearly',
] as const satisfies readonly PaymentTermPeriodUnit[];
const DUE_BASES = [
  'receipt_date',
  'vendor_invoice_date',
] as const satisfies readonly PaymentTermDueBasis[];

export const toPaymentTerm = (dto: PaymentTermDto): PaymentTerm => ({
  id: dto.id,
  name: dto.name,
  appliesTo: oneOf(dto.appliesTo, APPLIES_TO, 'both'),
  description: dto.description ?? '',
  usageExample: dto.usageExample ?? '',
  advanceType: oneOf(dto.advanceType, ADVANCE_TYPES, 'none'),
  defaultAdvancePercent: dto.defaultAdvancePercent ?? null,
  billingSplit: oneOf(dto.billingSplit, BILLING_SPLITS, 'single'),
  defaultInstallments: dto.defaultInstallments ?? null,
  advanceOutsideInstallments: dto.advanceOutsideInstallments ?? false,
  periodUnit: dto.periodUnit ? oneOf(dto.periodUnit, PERIOD_UNITS, 'monthly') : null,
  defaultPeriods: dto.defaultPeriods ?? null,
  hasDueTerm: dto.hasDueTerm ?? true,
  defaultDueDays: dto.defaultDueDays ?? null,
  dueBasis: oneOf(dto.dueBasis, DUE_BASES, 'vendor_invoice_date'),
  hasRetention: dto.hasRetention ?? false,
  defaultRetentionPercent: dto.defaultRetentionPercent ?? null,
  defaultMaintenanceMonths: dto.defaultMaintenanceMonths ?? null,
  isActive: dto.isActive ?? true,
  isDefault: dto.isDefault ?? false,
  summary: {
    paymentLabel: dto.summary?.paymentLabel ?? '',
    billingLabel: dto.summary?.billingLabel ?? '',
    dueLabel: dto.summary?.dueLabel ?? '',
  },
  usageCount: dto.usageCount ?? 0,
  usageBreakdown: {
    purchase: dto.usageBreakdown?.purchase ?? 0,
    sale: dto.usageBreakdown?.sale ?? 0,
  },
  // Without the flag the safe answer is "cannot delete"; the API still has the last word.
  canDelete: dto.canDelete ?? false,
});

export const toPaymentTermPage = (body: PaymentTermListDto): PaymentTermPage => {
  const rows = Array.isArray(body) ? body : (body?.data ?? []);
  const items = rows.map(toPaymentTerm);
  const sent = Array.isArray(body) ? undefined : body?.pagination;
  const total = sent?.total ?? items.length;
  const limit = sent?.limit ?? (items.length || 50);
  return {
    items,
    pagination: {
      total,
      page: sent?.page ?? 1,
      limit,
      totalPages: sent?.totalPages ?? (total === 0 ? 0 : Math.ceil(total / limit)),
    },
  };
};
