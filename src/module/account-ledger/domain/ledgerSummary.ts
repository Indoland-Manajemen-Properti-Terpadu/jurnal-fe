import { fromMinor, sumMinor } from '@/lib/money/money';
import type { DetailAccountModel } from '@/module/chart-of-accounts';

export interface MutationSummary {
  totalDebit: number;
  totalCredit: number;
  debitCount: number;
  creditCount: number;
  totalCount: number;
}

type MutationRow = { debit?: number | string | null; credit?: number | string | null };

const toAmount = (value: number | string | null | undefined): number => Number(value) || 0;

/** Display rounding: half up to the cent, so the sum is on integer minor units and has no float drift. */
const toCents = (amount: number): number => Math.round(amount * 100);

/** Totals and counts of the non zero debit and credit sides of an account's journal rows. */
export const summarizeMutations = (rows: readonly MutationRow[] | undefined): MutationSummary => {
  const list = rows ?? [];
  const debits = list.map((row) => toAmount(row.debit)).filter((amount) => amount > 0);
  const credits = list.map((row) => toAmount(row.credit)).filter((amount) => amount > 0);
  return {
    totalDebit: Number(fromMinor(sumMinor(debits.map(toCents)))),
    totalCredit: Number(fromMinor(sumMinor(credits.map(toCents)))),
    debitCount: debits.length,
    creditCount: credits.length,
    totalCount: list.length,
  };
};

/** Bank statement rows the reconciliation has not matched yet. */
export const countUnreconciled = (
  data: { bankStatements?: readonly { isReconciled?: boolean }[] } | undefined
): number => data?.bankStatements?.filter((statement) => !statement.isReconciled).length || 0;

/** The statement list comes as `results` or, in the older shape, `resultTransaction`. */
export const countStatements = (
  data: { results?: readonly unknown[]; resultTransaction?: readonly unknown[] | null } | undefined
): number => (data?.results || data?.resultTransaction || []).length;

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : undefined;

/** The detail endpoint answers `{data:{data:{...}}}`, `{data:{...}}` or the bare account. */
export const unwrapAccountDetail = (payload: unknown): Partial<DetailAccountModel> | undefined => {
  const outer = asRecord(payload);
  const inner = asRecord(outer?.data);
  return (asRecord(inner?.data) || inner || outer) as Partial<DetailAccountModel> | undefined;
};
