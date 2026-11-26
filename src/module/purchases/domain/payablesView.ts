import type { PayablesAging, PayablesAgingRow } from '@/module/purchases/domain/purchaseDocuments';

export type AgingBucketKey = 'current' | 'days1to30' | 'days31to60' | 'days61to90' | 'over90';

export const AGING_BUCKETS: AgingBucketKey[] = [
  'current',
  'days1to30',
  'days31to60',
  'days61to90',
  'over90',
];

type Totals = PayablesAging['totals'];

/** Past due: everything outside the "not yet due" bucket. */
export const overdueAmount = (totals: Totals): number =>
  Math.round((totals.days1to30 + totals.days31to60 + totals.days61to90 + totals.over90) * 100) /
  100;

export const bucketShares = (
  totals: Totals
): { key: AgingBucketKey; amount: number; share: number }[] =>
  AGING_BUCKETS.map((key) => ({
    key,
    amount: totals[key],
    share: totals.totalRemaining > 0 ? totals[key] / totals.totalRemaining : 0,
  }));

/** A row as the service sends it: the vendor is `{ id, name }` rather than a full contact. */
export interface RawAgingRow {
  vendor?: { id?: string; name?: string; displayName?: string } | string | null;
  vendorId?: string;
  vendorName?: string;
  billCount: number;
  totalRemaining: number;
  current: number;
  days1to30: number;
  days31to60: number;
  days61to90: number;
  over90: number;
}

export const normalizeAgingRow = (raw: RawAgingRow): PayablesAgingRow => {
  const vendor = typeof raw.vendor === 'object' && raw.vendor ? raw.vendor : null;
  return {
    vendorId: raw.vendorId ?? vendor?.id ?? (typeof raw.vendor === 'string' ? raw.vendor : ''),
    vendorName: raw.vendorName ?? vendor?.name ?? vendor?.displayName ?? '-',
    billCount: raw.billCount,
    totalRemaining: raw.totalRemaining,
    current: raw.current,
    days1to30: raw.days1to30,
    days31to60: raw.days31to60,
    days61to90: raw.days61to90,
    over90: raw.over90,
  };
};

/** Whole days a bill is past its due date on `asOf` (both `YYYY-MM-DD`); 0 when not yet due. */
export const daysLate = (dueDate: string | null, asOf: string): number => {
  if (!dueDate) {
    return 0;
  }
  const diff =
    Date.parse(`${asOf.slice(0, 10)}T00:00:00Z`) - Date.parse(`${dueDate.slice(0, 10)}T00:00:00Z`);
  return Math.max(0, Math.round(diff / 86_400_000));
};
