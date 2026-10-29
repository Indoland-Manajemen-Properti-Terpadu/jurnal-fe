import { isMatchAmountEqual, matchesBankDirection } from './FindAndReconModal';

describe('I8 reconciliation direction filter (characterization)', () => {
  it('a positive bank amount matches only journal lines with a debit', () => {
    expect(matchesBankDirection(500, { debit: 500, credit: 0 })).toBe(true);
    expect(matchesBankDirection(500, { debit: 0, credit: 500 })).toBe(false);
  });

  it('a negative bank amount matches only journal lines with a credit', () => {
    expect(matchesBankDirection(-500, { debit: 0, credit: 500 })).toBe(true);
    expect(matchesBankDirection(-500, { debit: 500, credit: 0 })).toBe(false);
  });

  it('a zero bank amount matches every line', () => {
    expect(matchesBankDirection(0, { debit: 0, credit: 0 })).toBe(true);
    expect(matchesBankDirection(0, { debit: 5, credit: 0 })).toBe(true);
  });

  it('a missing side counts as no match', () => {
    expect(matchesBankDirection(10, {})).toBe(false);
    expect(matchesBankDirection(-10, {})).toBe(false);
  });
});

describe('I8 reconciliation match gate (characterization)', () => {
  it('confirms only when the selected total equals the absolute bank amount', () => {
    expect(isMatchAmountEqual(1500.5, 1500.5)).toBe(true);
    expect(isMatchAmountEqual(1500.49, 1500.5)).toBe(false);
    expect(isMatchAmountEqual(1500.51, 1500.5)).toBe(false);
    expect(isMatchAmountEqual(0, 1500.5)).toBe(false);
  });
});
