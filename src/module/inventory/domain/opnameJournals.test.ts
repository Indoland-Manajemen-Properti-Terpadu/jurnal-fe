import type { StockMovement } from './stockMovement';
import { opnameJournalIds } from './opnameJournals';

const move = (overrides: Partial<StockMovement>): StockMovement =>
  ({ sourceId: 'so1', isReversal: false, journalId: 'j1', ...overrides }) as StockMovement;

describe('opnameJournalIds', () => {
  it('lists the journal of each movement the count posted, once', () => {
    const moves = [move({}), move({ id: 'm2' }), move({ journalId: 'j2' })];

    expect(opnameJournalIds(moves, 'so1')).toEqual(['j1', 'j2']);
  });

  it('ignores other documents, reversals and movements without a journal', () => {
    const moves = [
      move({ sourceId: 'so2', journalId: 'x' }),
      move({ isReversal: true, journalId: 'rev' }),
      move({ journalId: null }),
    ];

    expect(opnameJournalIds(moves, 'so1')).toEqual([]);
  });
});
