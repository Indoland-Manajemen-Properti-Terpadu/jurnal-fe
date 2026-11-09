import { describe, expect, it } from 'vitest';
import { toJournalHistoryPage } from './journalHistoryMapper';

describe('toJournalHistoryPage', () => {
  it('maps an entry with its lines, tags and void state', () => {
    const page = toJournalHistoryPage({
      data: {
        results: [
          {
            id: 'j1',
            transactionNumber: 12,
            transactionDate: '2026-01-05T00:00:00.000Z',
            transactionType: 'DEFAULT',
            status: 'ACTIVE',
            notes: 'Sewa',
            sourceType: null,
            tags: [{ id: 't1', name: 'Kantor' }],
            transactionDetail: [
              {
                id: 'l1',
                account: { id: 'a1', accountNumber: '1-100', name: 'Kas' },
                description: 'x',
                debit: 500,
                credit: 0,
              },
              {
                id: 'l2',
                account: { id: 'a2', accountNumber: '5-100', name: 'Sewa' },
                credit: 500,
              },
            ],
            totalDebit: 500,
            totalCredit: 500,
            canVoid: false,
            voidBlockedReason: 'Periode sudah ditutup',
          },
        ],
        page: 2,
        limit: 25,
        totalPages: 4,
        totalResults: 80,
      },
    });
    expect(page).toMatchObject({ page: 2, limit: 25, totalPages: 4, total: 80 });
    const [entry] = page.entries;
    expect(entry).toMatchObject({
      id: 'j1',
      transactionNumber: '12',
      sourceType: null,
      tags: ['Kantor'],
      canVoid: false,
      voidBlockedReason: 'Periode sudah ditutup',
      totalDebit: 500,
    });
    expect(entry.lines).toHaveLength(2);
    expect(entry.lines[1]).toMatchObject({ accountName: 'Sewa', debit: 0, credit: 500 });
  });

  it('survives an empty or odd answer', () => {
    expect(toJournalHistoryPage(null)).toMatchObject({ entries: [], page: 1, total: 0 });
    expect(toJournalHistoryPage({ data: { results: [null] } }).entries).toHaveLength(1);
  });
});
