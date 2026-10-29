/**
 * Journal balance rules on integer minor units (see `@/lib/money`). Each amount is rounded half
 * up to the cent first (decided on the 15 significant digit decimal value, so 1500.505 gives
 * 1500.51), then compared as integers. Amounts that are not finite numbers (NaN, empty or
 * non numeric strings) are invalid: `isJournalBalanced` and `canPublishOpeningBalance` return
 * false, `journalDifference` throws a RangeError.
 */
import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';

export interface AmountRow {
  debit: number | string;
  credit: number | string;
}

const toCents = (value: number | string): number => {
  const numeric = typeof value === 'string' ? (value.trim() === '' ? NaN : Number(value)) : value;
  if (!Number.isFinite(numeric)) {
    throw new RangeError(`Invalid amount: ${String(value)}`);
  }
  const cents = Math.round(Number((numeric * 100).toPrecision(15)));
  return toMinor(cents / 100);
};

const totals = (rows: AmountRow[]) => ({
  debit: sumMinor(rows.map((row) => toCents(row.debit))),
  credit: sumMinor(rows.map((row) => toCents(row.credit))),
});

/** Total debit minus total credit as a decimal string, for example "0.00" or "-12.50". */
export const journalDifference = (rows: AmountRow[]): string => {
  const { debit, credit } = totals(rows);
  return fromMinor(debit - credit);
};

export const isJournalBalanced = (rows: AmountRow[]): boolean => {
  try {
    const { debit, credit } = totals(rows);
    return debit === credit;
  } catch {
    return false;
  }
};

/** Opening balances publish only when total debit equals total credit and is above zero. */
export const canPublishOpeningBalance = (rows: AmountRow[]): boolean => {
  try {
    const { debit, credit } = totals(rows);
    return debit === credit && debit > 0;
  } catch {
    return false;
  }
};

/** A manual reconciliation match needs the selected amount to equal the absolute bank amount. */
export const canConfirmMatch = (selectedAmount: number, bankAmount: number): boolean => {
  try {
    return toCents(selectedAmount) === toCents(Math.abs(bankAmount));
  } catch {
    return false;
  }
};
