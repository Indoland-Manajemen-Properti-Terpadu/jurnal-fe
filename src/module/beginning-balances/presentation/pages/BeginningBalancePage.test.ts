import { checkOpeningPublish, summarizeOpeningBalance } from './BeginningBalancePage';

describe('I4 opening balance totals and publish gate (characterization)', () => {
  it('sums both sides and reports balanced when equal and above zero', () => {
    const result = summarizeOpeningBalance([
      { debit: 700000, credit: 0 },
      { debit: 300000, credit: 0 },
      { debit: 0, credit: 1000000 },
    ]);
    expect(result).toEqual({
      totalDebit: 1000000,
      totalCredit: 1000000,
      difference: 0,
      isBalanced: true,
    });
  });

  it('reports the absolute difference when unbalanced', () => {
    const result = summarizeOpeningBalance([
      { debit: 500, credit: 0 },
      { debit: 0, credit: 800 },
    ]);
    expect(result.difference).toBe(300);
    expect(result.isBalanced).toBe(false);
  });

  it('is not balanced when both totals are zero', () => {
    const result = summarizeOpeningBalance([{ debit: 0, credit: 0 }]);
    expect(result.isBalanced).toBe(false);
    expect(summarizeOpeningBalance([]).isBalanced).toBe(false);
  });

  it('counts missing or non numeric amounts as zero', () => {
    const result = summarizeOpeningBalance([
      { debit: undefined, credit: 'abc' },
      { debit: '1000', credit: null },
      { debit: 0, credit: 1000 },
    ]);
    expect(result.totalDebit).toBe(1000);
    expect(result.totalCredit).toBe(1000);
    expect(result.isBalanced).toBe(true);
  });

  it('publish gate: empty, then unbalanced, then ready', () => {
    expect(checkOpeningPublish(0, 0)).toBe('empty');
    expect(checkOpeningPublish(100, 0)).toBe('unbalanced');
    expect(checkOpeningPublish(0, 100)).toBe('unbalanced');
    expect(checkOpeningPublish(100, 99)).toBe('unbalanced');
    expect(checkOpeningPublish(100, 100)).toBe('ready');
  });
});
