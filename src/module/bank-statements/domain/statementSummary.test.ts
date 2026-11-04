import type { Result } from './bankStatement';
import type { BankStatementPreviewItem } from './importPreview';
import {
  findDuplicateRows,
  sortStatementsNewestFirst,
  summarizeStatements,
} from './statementSummary';

const statement = (overrides: Partial<Result>): Result => ({
  transactionName: 'X',
  transactionDate: new Date('2026-11-01'),
  debit: 0,
  credit: 0,
  reconciled: false,
  ...overrides,
});

describe('summarizeStatements', () => {
  it('sums both sides in cents and counts the unmatched rows', () => {
    const summary = summarizeStatements([
      statement({ debit: 0.1 }),
      statement({ debit: 0.2, reconciled: true }),
      statement({ credit: 0.05 }),
    ]);
    expect(summary).toEqual({
      count: 3,
      unreconciledCount: 2,
      totalReceived: 0.3,
      totalSent: 0.05,
      net: 0.25,
    });
  });

  it('is zero for no rows', () => {
    expect(summarizeStatements([])).toEqual({
      count: 0,
      unreconciledCount: 0,
      totalReceived: 0,
      totalSent: 0,
      net: 0,
    });
  });
});

describe('sortStatementsNewestFirst', () => {
  it('puts the newest day first and does not change the input', () => {
    const rows = [
      statement({ transactionName: 'a', transactionDate: new Date('2026-11-01') }),
      statement({ transactionName: 'b', transactionDate: new Date('2026-11-03') }),
      statement({ transactionName: 'c', transactionDate: new Date('2026-11-02') }),
    ];
    expect(sortStatementsNewestFirst(rows).map((r) => r.transactionName)).toEqual(['b', 'c', 'a']);
    expect(rows[0].transactionName).toBe('a');
  });
});

const draftRow = (rowIndex: number, date: string, amount: number, description: string) =>
  ({
    rowIndex,
    date,
    amount,
    Description: description,
    description,
  }) as BankStatementPreviewItem;

describe('findDuplicateRows', () => {
  it('flags a repeat inside the file but never the first occurrence', () => {
    const flagged = findDuplicateRows(
      [
        draftRow(1, '2026-11-01T00:00:00.000Z', 1000, 'SETORAN'),
        draftRow(2, '2026-11-01T00:00:00.000Z', 1000, ' setoran '),
        draftRow(3, '2026-11-01T00:00:00.000Z', -1000, 'SETORAN'),
      ],
      []
    );
    expect(Array.from(flagged)).toEqual([[2, 'inFile']]);
  });

  it('flags a row that was already imported for the account', () => {
    const flagged = findDuplicateRows(
      [draftRow(1, '2026-11-01T00:00:00.000Z', 1000, 'SETORAN')],
      [statement({ transactionName: 'SETORAN', debit: 1000 })]
    );
    expect(Array.from(flagged)).toEqual([[1, 'alreadyImported']]);
  });

  it('treats a sent amount as the negative of a received one', () => {
    const flagged = findDuplicateRows(
      [draftRow(1, '2026-11-02T00:00:00.000Z', -250, 'ADMIN')],
      [
        statement({
          transactionName: 'ADMIN',
          transactionDate: new Date('2026-11-02'),
          credit: 250,
        }),
      ]
    );
    expect(flagged.get(1)).toBe('alreadyImported');
  });
});
