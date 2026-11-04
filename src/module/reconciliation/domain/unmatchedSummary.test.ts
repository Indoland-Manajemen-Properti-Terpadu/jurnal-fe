import { summarizeUnmatched } from './unmatchedSummary';

describe('summarizeUnmatched', () => {
  it('nets the statements by sign and the journal lines by debit minus credit', () => {
    const summary = summarizeUnmatched(
      [{ amount: 1000000 }, { amount: -250000 }, { amount: 123456 }],
      [{ debit: 75000 }, { credit: 20000 }]
    );
    expect(summary).toEqual({
      statementCount: 3,
      statementNet: 873456,
      journalCount: 2,
      journalNet: 55000,
      difference: 818456,
    });
  });

  it('has no float noise in the difference', () => {
    const summary = summarizeUnmatched([{ amount: 0.3 }], [{ debit: 0.1 }]);
    expect(summary.difference).toBe(0.2);
  });

  it('is zero when both sides are empty', () => {
    expect(summarizeUnmatched([], [])).toEqual({
      statementCount: 0,
      statementNet: 0,
      journalCount: 0,
      journalNet: 0,
      difference: 0,
    });
  });
});
