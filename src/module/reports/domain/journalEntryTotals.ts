import { fromMinor, sumMinor } from '@/lib/money/money';
import type { ReportJournalEntryModel } from './JournalEntry.types';

/** Rounds one amount half up to the cent; a missing or non-finite amount counts as zero. */
const toCents = (value: number | undefined): number =>
  Number.isFinite(value) ? Math.round(Number(((value as number) * 100).toPrecision(15))) : 0;

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
