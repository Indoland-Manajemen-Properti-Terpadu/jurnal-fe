/**
 * Journal entry rules, on integer minor units (see `@/lib/money`).
 *
 * - I1 (`isJournalBlocked`): a new journal saves only when every row has an account and an
 *   amount, and total debit equals total credit exactly. The two-row minimum is enforced by the
 *   form (the remove button), not here, exactly as before.
 * - I2 (`holdsBothSides`): a row holds one side only. The form disables the opposite input; the
 *   validation card flags a row that still has both.
 * - I8 (`hasSameAccountOnBothSides`): the same account cannot sit on a debit row and on a credit row
 *   of one journal; the validation card says so and the save stays blocked.
 * - I3 (`isDetailBalanced`): the detail view shows "balanced" when debit and credit are equal
 *   after rounding half up to the cent. Create is exact, the view is tolerant: kept as is.
 */
import { sumMinor } from '@/lib/money/money';
import { isJournalBalanced, isJournalBalancedForDisplay } from '@/lib/accounting/journalBalance';
import type { DraftLine } from './journalEntry';

type AmountLike = number | string | null | undefined;

/** Rounds half up to the cent and returns integer minor units. Invalid input counts as zero. */
export const roundToMinor = (value: AmountLike): number => {
  const numeric = typeof value === 'string' ? Number(value) : value;
  if (typeof numeric !== 'number' || !Number.isFinite(numeric)) {
    return 0;
  }
  const cents = Math.round(Number((numeric * 100).toPrecision(15)));
  return cents === 0 ? 0 : cents;
};

/**
 * Parses an amount typed into a form field: rounded half up to the cent, never NaN.
 * Replaces the old `Number(value) || 0`, which kept every decimal the user typed.
 */
export const parseAmountInput = (value: AmountLike): number => roundToMinor(value) / 100;

/** Sums amounts in minor units (each rounded half up to the cent) and returns the plain number. */
export const sumAmounts = (values: AmountLike[]): number =>
  sumMinor(values.map(roundToMinor)) / 100;

/** Absolute gap between two totals in minor units, as a number of currency units. */
export const absoluteDifference = (totalDebit: number, totalCredit: number): number =>
  Math.abs(roundToMinor(totalDebit) - roundToMinor(totalCredit)) / 100;

/** I3: the detail view reads a journal as balanced when it balances after rounding to the cent. */
export const isDetailBalanced = (totalDebit: number, totalCredit: number): boolean =>
  isJournalBalancedForDisplay([{ debit: totalDebit, credit: totalCredit }]);

const positive = (value: unknown): boolean => parseFloat(`${value}`) > 0;

/** I2: a row that has both a debit and a credit amount. */
export const holdsBothSides = (line: Pick<DraftLine, 'debit' | 'credit'>): boolean =>
  positive(line.debit) && positive(line.credit);

/** I8: an account that carries a debit on one row and a credit on another cancels itself out. A single row holding both sides is I2. */
export const hasSameAccountOnBothSides = (
  lines: Pick<DraftLine, 'account' | 'debit' | 'credit'>[]
): boolean =>
  lines.some(
    (credited, index) =>
      credited.account &&
      positive(credited.credit) &&
      lines.some(
        (debited, other) =>
          other !== index && debited.account === credited.account && positive(debited.debit)
      )
  );

/** The backend takes a custom transaction number only as a whole number; empty means automatic. */
export const isValidTransactionNumber = (value: string): boolean =>
  value.trim() === '' || (/^\d+$/.test(value.trim()) && Number.isSafeInteger(Number(value.trim())));

/** I1: true when the journal must not be saved. */
export const isJournalBlocked = (lines: DraftLine[]): boolean => {
  const missingAccount = lines.some((line) => line.account === '');
  const missingAmount = lines.some(
    (line) => parseFloat(`${line.debit}`) === 0 && parseFloat(`${line.credit}`) === 0
  );
  const unbalanced = !isJournalBalanced(
    lines.map((line) => ({
      debit: parseFloat(`${line.debit}`),
      credit: parseFloat(`${line.credit}`),
    }))
  );
  return missingAccount || missingAmount || unbalanced || hasSameAccountOnBothSides(lines);
};

export interface JournalTotals {
  totalDebit: number;
  totalCredit: number;
  difference: number;
  isBalanced: boolean;
  hasValues: boolean;
}

/** Totals shown while the user types. Balanced needs both sides above zero and equal totals. */
export const summarizeLines = (lines: Pick<DraftLine, 'debit' | 'credit'>[]): JournalTotals => {
  const totalDebit = sumAmounts(lines.map((line) => line.debit));
  const totalCredit = sumAmounts(lines.map((line) => line.credit));
  const difference = absoluteDifference(totalDebit, totalCredit);
  return {
    totalDebit,
    totalCredit,
    difference,
    isBalanced: totalDebit > 0 && totalCredit > 0 && difference === 0,
    hasValues: totalDebit > 0 || totalCredit > 0,
  };
};

export interface ValidationChecks {
  hasDate: boolean;
  hasMinRows: boolean;
  allAccountsSelected: boolean;
  allRowsHaveAmount: boolean;
  isBalanced: boolean;
  /** No account is debited on one row and credited on another (I8). */
  noSameAccount: boolean;
}

/** The checklist of the validation card. `allRowsHaveAmount` also fails a row with both sides (I2). */
export const validateDraft = (lines: DraftLine[], transactionDate: string): ValidationChecks => ({
  hasDate: !!transactionDate,
  hasMinRows: lines.length >= 2,
  allAccountsSelected: lines.length > 0 && lines.every((line) => !!line.account),
  allRowsHaveAmount:
    lines.length > 0 &&
    lines.every((line) => (positive(line.debit) || positive(line.credit)) && !holdsBothSides(line)),
  isBalanced: summarizeLines(lines).isBalanced,
  noSameAccount: !hasSameAccountOnBothSides(lines),
});
