import type { Result } from './bankStatement';
import type { BankStatementPreviewItem } from './importPreview';

export interface StatementSummary {
  count: number;
  unreconciledCount: number;
  totalReceived: number;
  totalSent: number;
  /** Received minus sent over every imported row: the movement of the statements, not a balance. */
  net: number;
}

const cents = (amount: number | undefined): number => Math.round((amount || 0) * 100);

/** Totals of the imported rows, summed in cents so a long list leaves no float residue. */
export const summarizeStatements = (rows: readonly Result[]): StatementSummary => {
  const received = rows.reduce((sum, row) => sum + cents(row.debit), 0);
  const sent = rows.reduce((sum, row) => sum + cents(row.credit), 0);
  return {
    count: rows.length,
    unreconciledCount: rows.filter((row) => !row.reconciled).length,
    totalReceived: received / 100,
    totalSent: sent / 100,
    net: (received - sent) / 100,
  };
};

const time = (value: Date | string | undefined): number => {
  const parsed = value ? new Date(value).getTime() : NaN;
  return Number.isNaN(parsed) ? 0 : parsed;
};

/** Newest first; rows of the same day keep the order the server sent. */
export const sortStatementsNewestFirst = (rows: readonly Result[]): Result[] =>
  [...rows].sort((a, b) => time(b.transactionDate) - time(a.transactionDate));

export type DuplicateReason = 'inFile' | 'alreadyImported';

const day = (value: Date | string | null | undefined): string => {
  const parsed = value ? new Date(value) : null;
  return parsed && !Number.isNaN(parsed.getTime()) ? parsed.toISOString().slice(0, 10) : '';
};

const key = (date: string, signedAmount: number, description: string): string =>
  `${date}|${Math.round(signedAmount * 100)}|${description.trim().toLowerCase()}`;

/**
 * Rows of the draft that repeat an earlier row of the file or a row already imported for the
 * account (same day, same signed amount, same description). The first occurrence in the file is
 * never flagged; the server does not check this.
 */
export const findDuplicateRows = (
  draft: readonly BankStatementPreviewItem[],
  existing: readonly Result[]
): Map<number, DuplicateReason> => {
  const imported = new Set(
    existing.map((row) =>
      key(day(row.transactionDate), (row.debit || 0) - (row.credit || 0), row.transactionName || '')
    )
  );
  const seen = new Set<string>();
  const flagged = new Map<number, DuplicateReason>();
  draft.forEach((row) => {
    const rowKey = key(day(row.date), row.amount ?? 0, row.Description || row.description || '');
    if (imported.has(rowKey)) flagged.set(row.rowIndex, 'alreadyImported');
    else if (seen.has(rowKey)) flagged.set(row.rowIndex, 'inFile');
    seen.add(rowKey);
  });
  return flagged;
};
