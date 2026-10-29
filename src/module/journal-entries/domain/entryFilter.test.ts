import type { JournalEntryByAccount } from './journalEntry';
import { filterEntries } from './entryFilter';

const entry = (over: Partial<JournalEntryByAccount>): JournalEntryByAccount => ({
  id: '1',
  transactionNumber: 1,
  transactionDate: new Date('2026-05-01T08:00:00'),
  transactionDetail: [],
  status: '-',
  amount: 0,
  credit: 0,
  debit: 0,
  balance: 0,
  attachments: [],
  notes: '',
  site: '',
  createdAt: '',
  updatedAt: '',
  ...over,
});

describe('filterEntries', () => {
  const list = [
    entry({ id: '1', transactionNumber: 12, notes: 'Sewa kantor' }),
    entry({ id: '2', transactionNumber: 13, transactionDate: new Date('2026-06-02T08:00:00') }),
  ];

  it('returns everything without filters', () => {
    expect(filterEntries(list, '', null)).toHaveLength(2);
  });

  it('matches the number and the memo, ignoring case and spaces', () => {
    expect(filterEntries(list, ' 13 ', null).map((e) => e.id)).toEqual(['2']);
    expect(filterEntries(list, 'SEWA', null).map((e) => e.id)).toEqual(['1']);
  });

  it('matches the calendar day', () => {
    expect(filterEntries(list, '', '2026-06-02').map((e) => e.id)).toEqual(['2']);
  });
});
