import { blockedBySharedJournal, rowsSharingSuggestion } from './matchGuards';
import type { JournalDetail, ReconciliationRow } from './reconciliation';

const journal = (id: string) => ({ id, debit: 1, credit: 0 }) as JournalDetail;
const row = (id: string, journals: JournalDetail[]): ReconciliationRow => ({
  bankStatement: { id, amount: 1, date: '', description: '', isReconciled: false },
  journalTransactions: journals,
  isRecommendation: true,
});

const rows = [row('s1', [journal('j1')]), row('s2', [journal('j1')]), row('s3', [journal('j3')])];

describe('blockedBySharedJournal', () => {
  it('keeps the first selected row and blocks the others that suggest the same line', () => {
    expect(Array.from(blockedBySharedJournal(rows, ['s1', 's2', 's3'], 'acc'))).toEqual(['s2']);
  });

  it('follows the order of the selection, not the order of the list', () => {
    expect(Array.from(blockedBySharedJournal(rows, ['s2', 's1'], 'acc'))).toEqual(['s1']);
  });

  it('blocks nothing when the selected rows use different lines', () => {
    expect(blockedBySharedJournal(rows, ['s1', 's3'], 'acc').size).toBe(0);
  });
});

describe('rowsSharingSuggestion', () => {
  it('lists every row that shares a line with another row', () => {
    expect(Array.from(rowsSharingSuggestion(rows, 'acc')).sort()).toEqual(['s1', 's2']);
  });
});
