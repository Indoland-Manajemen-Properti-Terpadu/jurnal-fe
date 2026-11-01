/**
 * Journal balance rules on integer minor units (see `@/lib/money`).
 *
 * Two families, on purpose:
 * - Gates (`isJournalBalanced`, `canPublishOpeningBalance`, `canConfirmMatch`) are EXACT. Each
 *   amount is first normalized to 15 significant digits (absorbs float noise such as
 *   0.1 + 0.2), then converted with `toMinor`. An amount with more than two decimals is not valid
 *   money: the gate returns false. Invalid input (NaN, Infinity, empty or non numeric string)
 *   also returns false.
 * - Display (`isJournalBalancedForDisplay`, `journalDifference`) rounds half up to the cent so a
 *   render path never crashes on stored data. Only non finite input is invalid: the boolean
 *   returns false, `journalDifference` throws a RangeError.
 */
import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';

export interface AmountRow {
  debit: number | string;
  credit: number | string;
}

const toNumber = (value: number | string): number => {
  const numeric = typeof value === 'string' ? (value.trim() === '' ? NaN : Number(value)) : value;
  if (!Number.isFinite(numeric)) {
    throw new RangeError(`Invalid amount: ${String(value)}`);
  }
  return Number(numeric.toPrecision(15));
};

/** Exact: throws RangeError for more than two decimals or invalid input. */
const toExactCents = (value: number | string): number => toMinor(toNumber(value));

/** Rounded half up to the cent: throws only for invalid input. */
const toRoundedCents = (value: number | string): number =>
  toMinor(Math.round(Number((toNumber(value) * 100).toPrecision(15))) / 100);

const totals = (rows: AmountRow[], toCents: (value: number | string) => number) => ({
  debit: sumMinor(rows.map((row) => toCents(row.debit))),
  credit: sumMinor(rows.map((row) => toCents(row.credit))),
});

/** Display helper: total debit minus total credit, rounded half up to the cent, as "12.50". */
export const journalDifference = (rows: AmountRow[]): string => {
  const { debit, credit } = totals(rows, toRoundedCents);
  return fromMinor(debit - credit);
};

/** Display helper: balanced after rounding each amount half up to the cent. Never throws. */
export const isJournalBalancedForDisplay = (rows: AmountRow[]): boolean => {
  try {
    const { debit, credit } = totals(rows, toRoundedCents);
    return debit === credit;
  } catch {
    return false;
  }
};

/** Gate: total debit equals total credit exactly. */
export const isJournalBalanced = (rows: AmountRow[]): boolean => {
  try {
    const { debit, credit } = totals(rows, toExactCents);
    return debit === credit;
  } catch {
    return false;
  }
};

/** Gate: opening balances publish only when total debit equals total credit and is above zero. */
export const canPublishOpeningBalance = (rows: AmountRow[]): boolean => {
  try {
    const { debit, credit } = totals(rows, toExactCents);
    return debit === credit && debit > 0;
  } catch {
    return false;
  }
};

/** Gate: a manual reconciliation match needs the selected amount to equal the absolute bank amount. */
export const canConfirmMatch = (selectedAmount: number, bankAmount: number): boolean => {
  try {
    return toExactCents(selectedAmount) === toExactCents(Math.abs(bankAmount));
  } catch {
    return false;
  }
};
