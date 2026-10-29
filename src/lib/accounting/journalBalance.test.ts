import {
  canConfirmMatch,
  canPublishOpeningBalance,
  isJournalBalanced,
  isJournalBalancedForDisplay,
  journalDifference,
} from './journalBalance';

const rows = (...pairs: [number | string, number | string][]) =>
  pairs.map(([debit, credit]) => ({ debit, credit }));

describe('isJournalBalanced', () => {
  it('accepts equal totals and rejects one cent apart', () => {
    expect(isJournalBalanced(rows([1000, 0], [0, 1000]))).toBe(true);
    expect(isJournalBalanced(rows([1000.01, 0], [0, 1000]))).toBe(false);
  });

  it('absorbs float drift: 0.1 + 0.2 equals 0.3', () => {
    expect(isJournalBalanced(rows([0.1, 0], [0.2, 0], [0, 0.3]))).toBe(true);
    expect(isJournalBalanced(rows([0.1 + 0.2, 0], [0, 0.3]))).toBe(true);
  });

  it('is exact: amounts with more than two decimals are blocked, never rounded', () => {
    expect(isJournalBalanced(rows([100.004, 0], [0, 100]))).toBe(false);
    expect(isJournalBalanced(rows([100.009, 0], [0, 100]))).toBe(false);
    expect(isJournalBalanced(rows([1500.505, 0], [0, 1500.51]))).toBe(false);
    expect(isJournalBalanced(rows([1500.505, 0], [0, 1500.505]))).toBe(false);
  });

  it('accepts decimal strings', () => {
    expect(isJournalBalanced(rows(['250', 0], [0, '250.00']))).toBe(true);
  });

  it('treats NaN, empty and non numeric input as not balanced', () => {
    expect(isJournalBalanced(rows([NaN, 0], [0, 0]))).toBe(false);
    expect(isJournalBalanced(rows(['', 0], [0, 0]))).toBe(false);
    expect(isJournalBalanced(rows(['abc', 0], [0, 0]))).toBe(false);
    expect(isJournalBalanced(rows([Infinity, 0], [0, Infinity]))).toBe(false);
  });

  it('an empty journal is balanced at zero', () => {
    expect(isJournalBalanced([])).toBe(true);
  });
});

describe('journalDifference', () => {
  it('returns debit minus credit as a decimal string', () => {
    expect(journalDifference(rows([100, 0], [0, 100]))).toBe('0.00');
    expect(journalDifference(rows([100.5, 0], [0, 88]))).toBe('12.50');
    expect(journalDifference(rows([10, 0], [0, 12.25]))).toBe('-2.25');
    expect(journalDifference(rows([0.1, 0], [0.2, 0], [0, 0.3]))).toBe('0.00');
    expect(journalDifference(rows([1500.505, 0]))).toBe('1500.51');
  });

  it('throws on invalid input', () => {
    expect(() => journalDifference(rows([NaN, 0]))).toThrow(RangeError);
    expect(() => journalDifference(rows(['', 0]))).toThrow(RangeError);
  });
});

describe('canPublishOpeningBalance', () => {
  it('needs equal totals above zero', () => {
    expect(canPublishOpeningBalance(rows([700, 0], [300, 0], [0, 1000]))).toBe(true);
    expect(canPublishOpeningBalance(rows([0, 0]))).toBe(false);
    expect(canPublishOpeningBalance([])).toBe(false);
    expect(canPublishOpeningBalance(rows([100, 0], [0, 99]))).toBe(false);
    expect(canPublishOpeningBalance(rows([NaN, 0], [0, 0]))).toBe(false);
    expect(canPublishOpeningBalance(rows([100.004, 0], [0, 100]))).toBe(false);
  });
});

describe('canConfirmMatch', () => {
  it('compares the selected amount with the absolute bank amount', () => {
    expect(canConfirmMatch(1500.5, 1500.5)).toBe(true);
    expect(canConfirmMatch(1500.5, -1500.5)).toBe(true);
    expect(canConfirmMatch(1500.49, 1500.5)).toBe(false);
    expect(canConfirmMatch(0.1 + 0.2, 0.3)).toBe(true);
    expect(canConfirmMatch(NaN, 10)).toBe(false);
    expect(canConfirmMatch(100.004, 100)).toBe(false);
    expect(canConfirmMatch(100, -100.004)).toBe(false);
  });
});

describe('isJournalBalancedForDisplay', () => {
  it('rounds half up to the cent and never throws', () => {
    expect(isJournalBalancedForDisplay(rows([100.004, 0], [0, 100]))).toBe(true);
    expect(isJournalBalancedForDisplay(rows([100.009, 0], [0, 100]))).toBe(false);
    expect(isJournalBalancedForDisplay(rows([1500.505, 0], [0, 1500.51]))).toBe(true);
    expect(isJournalBalancedForDisplay(rows([0.1, 0], [0.2, 0], [0, 0.3]))).toBe(true);
    expect(isJournalBalancedForDisplay(rows([1.2041, 0], [0, 1.2]))).toBe(true);
    expect(isJournalBalancedForDisplay(rows([NaN, 0]))).toBe(false);
    expect(isJournalBalancedForDisplay(rows(['', 0]))).toBe(false);
  });
});

describe('journalDifference on stored data with more than two decimals', () => {
  it('rounds instead of throwing', () => {
    expect(journalDifference(rows([100.004, 0], [0, 100]))).toBe('0.00');
    expect(journalDifference(rows([1.2345, 0]))).toBe('1.23');
  });
});
