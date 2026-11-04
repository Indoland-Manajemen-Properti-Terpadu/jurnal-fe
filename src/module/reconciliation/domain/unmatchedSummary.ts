import type { BankStatementData } from './reconciliation';

export interface UnmatchedSummary {
  statementCount: number;
  /** Signed net of the statement rows: received positive, sent negative. */
  statementNet: number;
  journalCount: number;
  /** Debit minus credit of the journal lines, the same sign as the bank side. */
  journalNet: number;
  /** What is left between the two sides once both lists are matched out. */
  difference: number;
}

const cents = (value: number): number => Math.round(value * 100);

/**
 * The two sides of a bank reconciliation: statement rows with no journal and journal lines with
 * no statement row. Both are shown in cents so the difference has no float noise.
 */
export const summarizeUnmatched = (
  statements: readonly Pick<BankStatementData, 'amount'>[],
  journals: readonly { debit?: number | null; credit?: number | null }[]
): UnmatchedSummary => {
  const statementCents = statements.reduce((sum, row) => sum + cents(row.amount || 0), 0);
  const journalCents = journals.reduce(
    (sum, line) => sum + cents(line.debit || 0) - cents(line.credit || 0),
    0
  );
  return {
    statementCount: statements.length,
    statementNet: statementCents / 100,
    journalCount: journals.length,
    journalNet: journalCents / 100,
    difference: (statementCents - journalCents) / 100,
  };
};
