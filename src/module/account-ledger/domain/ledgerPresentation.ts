import { formatCurrency } from '@/utils/formatCurrency';

/** A negative balance is written in brackets, the same way the ledger table and the account list do. */
export const formatBalance = (amount: number): string =>
  amount >= 0 ? formatCurrency(amount) : `(${formatCurrency(Math.abs(amount))})`;

export type ReconciliationState = 'none' | 'matched' | 'pending';

/**
 * Without any imported statement row there is nothing to match, so the account is not "matched";
 * any unmatched statement row makes it pending.
 */
export const getReconciliationState = (
  totalStatements: number,
  unreconciledCount: number
): ReconciliationState => {
  if (unreconciledCount > 0) return 'pending';
  return totalStatements > 0 ? 'matched' : 'none';
};

/** Ledger minus bank, rounded to the cent so floats do not leave a trailing 0.0000001. */
export const balanceDifference = (ledgerAmount: number, bankBalance: number): number =>
  Math.round((ledgerAmount - bankBalance) * 100) / 100;

/** The most recent transaction date of the rows, or undefined without a valid date. */
export const latestTransactionDate = (
  rows: readonly { transactionDate?: Date | string | null }[] | undefined
): Date | undefined => {
  let latest: Date | undefined;
  (rows ?? []).forEach((row) => {
    if (!row.transactionDate) return;
    const date = new Date(row.transactionDate);
    if (Number.isNaN(date.getTime())) return;
    if (!latest || date > latest) latest = date;
  });
  return latest;
};
