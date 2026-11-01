import type { ReportJournalEntryModel } from './JournalEntry.types';
import { calcJournalEntryTotals } from './journalEntryTotals';

const entry = (...lines: Array<{ debit?: number; credit?: number }>): ReportJournalEntryModel =>
  ({
    id: 'j',
    transactionNumber: 1,
    transactionDate: new Date('2026-01-01'),
    transactionDetail: lines.map((line, index) => ({
      id: String(index),
      description: '',
      ...line,
    })),
  }) as ReportJournalEntryModel;

describe('calcJournalEntryTotals', () => {
  it('sums debit and credit across all entries and lines', () => {
    expect(
      calcJournalEntryTotals([
        entry({ debit: 1000 }, { credit: 1000 }),
        entry({ debit: 500 }, { credit: 500 }),
      ])
    ).toEqual({ totalDebit: 1500, totalCredit: 1500 });
  });

  it('adds decimals without floating point artefacts', () => {
    expect(
      calcJournalEntryTotals([
        entry({ debit: 0.1, credit: 0.2 }),
        entry({ debit: 0.2, credit: 0.1 }),
      ])
    ).toEqual({ totalDebit: 0.3, totalCredit: 0.3 });
  });

  it('counts missing, zero and NaN amounts as 0', () => {
    expect(
      calcJournalEntryTotals([entry({}, { debit: 0, credit: Number.NaN }, { debit: 2.5 })])
    ).toEqual({ totalDebit: 2.5, totalCredit: 0 });
  });

  it('returns zeros for an empty list', () => {
    expect(calcJournalEntryTotals([])).toEqual({ totalDebit: 0, totalCredit: 0 });
  });
});

describe('calcJournalEntryTotals with numeric strings', () => {
  it('counts numeric string amounts instead of dropping them', () => {
    const line = { id: '1', description: '', debit: '100.50', credit: '0.10' } as unknown;
    const entries = [
      {
        id: 'j',
        transactionNumber: 1,
        transactionDate: new Date('2026-01-01'),
        transactionDetail: [line],
      },
    ] as ReportJournalEntryModel[];

    expect(calcJournalEntryTotals(entries)).toEqual({ totalDebit: 100.5, totalCredit: 0.1 });
  });
});
