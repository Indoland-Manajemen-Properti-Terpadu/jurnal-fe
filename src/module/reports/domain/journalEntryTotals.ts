import { fromMinor, sumMinor } from '@/lib/money/money';
import type { ReportJournalEntryModel } from './JournalEntry.types';

/** Rounds one amount half up to the cent; numeric strings count, anything else counts as zero. */
const toCents = (value: unknown): number => {
  const amount = typeof value === 'string' ? Number(value) : value;
  return typeof amount === 'number' && Number.isFinite(amount)
    ? Math.round(Number((amount * 100).toPrecision(15)))
    : 0;
};

const totalOf = (entries: ReportJournalEntryModel[], side: 'debit' | 'credit'): number =>
  Number(
    fromMinor(
      sumMinor(
        entries.flatMap((entry) => entry.transactionDetail.map((line) => toCents(line[side])))
      )
    )
  );

/** Debit and credit totals over every line of every entry, summed in whole cents. */
export const calcJournalEntryTotals = (
  entries: ReportJournalEntryModel[]
): { totalDebit: number; totalCredit: number } => ({
  totalDebit: totalOf(entries, 'debit'),
  totalCredit: totalOf(entries, 'credit'),
});
