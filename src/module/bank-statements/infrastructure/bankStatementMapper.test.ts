import { toStatementRows } from './bankStatementMapper';

describe('toStatementRows', () => {
  it('sends a positive amount to received and a negative one to spent', () => {
    const rows = toStatementRows({
      data: { results: [{ amount: 150000.5 }, { amount: -2500.75 }, { amount: 0 }, {}] },
    });
    expect(rows.map((r) => [r.debit, r.credit])).toEqual([
      [150000.5, 0],
      [0, 2500.75],
      [0, 0],
      [0, 0],
    ]);
  });

  it('reads a numeric string amount as a number', () => {
    const rows = toStatementRows([{ amount: '-10.5' }]);
    expect(rows[0]).toMatchObject({ debit: 0, credit: 10.5 });
  });

  it('prefers description, date and isReconciled, falling back to the other names', () => {
    const rows = toStatementRows([
      {
        description: 'A',
        transactionName: 'B',
        date: 'd1',
        transactionDate: 'd2',
        isReconciled: true,
      },
      { transactionName: 'B', transactionDate: 'd2', reconciled: false },
    ]);
    expect(rows[0]).toMatchObject({
      transactionName: 'A',
      transactionDate: 'd1',
      reconciled: true,
    });
    expect(rows[1]).toMatchObject({
      transactionName: 'B',
      transactionDate: 'd2',
      reconciled: false,
    });
  });

  it('returns an empty list for null or an unknown shape', () => {
    expect(toStatementRows(null)).toEqual([]);
    expect(toStatementRows({ foo: 1 })).toEqual([]);
  });
});
