import { isDetailBalanced } from './JournalTransactionDetail';

describe('I3 journal detail page view tolerance (characterization)', () => {
  it('reads equal totals as balanced', () => {
    expect(isDetailBalanced(1500.5, 1500.5)).toBe(true);
    expect(isDetailBalanced(0, 0)).toBe(true);
  });

  it('reads a difference below a cent as balanced', () => {
    expect(isDetailBalanced(100.004, 100)).toBe(true);
    expect(isDetailBalanced(100, 100.004)).toBe(true);
  });

  it('reads a difference of one cent or more as unbalanced', () => {
    expect(isDetailBalanced(100.01, 100)).toBe(false);
    expect(isDetailBalanced(100, 100.02)).toBe(false);
    expect(isDetailBalanced(1000, 900)).toBe(false);
  });

  it('absorbs float drift in two-decimal sums', () => {
    expect(isDetailBalanced(0.1 + 0.2, 0.3)).toBe(true);
  });
});
