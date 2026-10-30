/**
 * Reconciliation rules (invariant I8).
 *
 * - A manual match is confirmed only when the selected total equals the absolute bank amount
 *   (`canConfirmMatch` of the accounting kernel, exact to the cent).
 * - Direction filter: a positive bank amount (received) matches journal lines with a debit, a
 *   negative one (sent) matches lines with a credit; a zero amount matches every line.
 * - Auto-match (the checkbox flow on the recommended rows) has NO client check: it sends the
 *   server recommendation as it is. Only the manual modal enforces the amount gate.
 */
import { canConfirmMatch } from '@/lib/accounting/journalBalance';
import { sumMinor, toMinor } from '@/lib/money/money';
import type { BankStatementData, JournalDetail, MatchPayload } from './reconciliation';

export { canConfirmMatch };

/** Positive bank amount (received) matches journal debit, negative (sent) matches credit. */
export const matchesBankDirection = (
  bankAmount: number,
  line: { debit?: number; credit?: number }
): boolean => {
  if (bankAmount > 0) return (line.debit as number) > 0;
  if (bankAmount < 0) return (line.credit as number) > 0;
  return true;
};

/** The amount a journal row counts for: its debit, else its credit, else 0. */
export const lineAmount = (line: Pick<JournalDetail, 'debit' | 'credit'>): number =>
  line.debit || line.credit || 0;

/** Total of the selected journal rows. Plain sum: the gate normalizes float noise itself. */
export const selectedTotal = (records: Pick<JournalDetail, 'debit' | 'credit'>[]): number =>
  records.reduce((total, record) => total + lineAmount(record), 0);

/**
 * The id to send for a journal row. A row that carries `transactionDetail` is resolved to the
 * line of the open account (`idAccount`), falling back to the row id; any other row sends its id.
 */
export const resolveJournalDetailId = (
  journal: Pick<JournalDetail, 'id' | 'transactionDetail'>,
  idAccount: string | undefined
): string => {
  if (journal.transactionDetail && Array.isArray(journal.transactionDetail)) {
    const detail = journal.transactionDetail.find((line) => line.account === idAccount);
    return detail ? detail.id : journal.id;
  }
  return journal.id;
};

export const buildMatch = (
  bankStatement: Pick<BankStatementData, 'id'>,
  journals: JournalDetail[],
  idAccount: string | undefined
): MatchPayload['matches'][number] => ({
  bankStatementId: bankStatement.id,
  journalDetailIds: journals.map((journal) => resolveJournalDetailId(journal, idAccount)),
});

/** Normalizes float noise to 15 significant digits, then to cents. */
const toCents = (value: number): number => toMinor(Number(value.toPrecision(15)));

/**
 * Display balance when the server sends none: debit minus credit of the top recommendation of
 * every statement. Exact in cents; amounts with more than two decimals fall back to the plain
 * float difference (display only, never a gate).
 */
export const recommendedBalance = (statements: BankStatementData[]): number => {
  const lines = statements
    .map((statement) => statement.recommendations?.[0]?.journalDetail)
    .filter((line): line is JournalDetail => Boolean(line));
  const debits = lines.map((line) => line.debit || 0);
  const credits = lines.map((line) => line.credit || 0);
  try {
    return (sumMinor(debits.map(toCents)) - sumMinor(credits.map(toCents))) / 100;
  } catch {
    return sumMinor(debits) - sumMinor(credits);
  }
};
