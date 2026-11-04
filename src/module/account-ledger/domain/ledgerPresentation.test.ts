import { formatBalance, getReconciliationState, latestTransactionDate } from './ledgerPresentation';

describe('formatBalance', () => {
  it('writes a negative balance in brackets and a positive one plainly', () => {
    expect(formatBalance(1000).replace(/\s/g, ' ')).toBe('Rp 1.000,00');
    expect(formatBalance(-1000).replace(/\s/g, ' ')).toBe('(Rp 1.000,00)');
    expect(formatBalance(0).replace(/\s/g, ' ')).toBe('Rp 0,00');
  });
});

describe('getReconciliationState', () => {
  it('is none without statement rows, pending with an unmatched row, else matched', () => {
    expect(getReconciliationState(0, 0)).toBe('none');
    expect(getReconciliationState(3, 0)).toBe('matched');
    expect(getReconciliationState(3, 1)).toBe('pending');
    expect(getReconciliationState(0, 2)).toBe('pending');
  });
});

describe('latestTransactionDate', () => {
  it('picks the newest valid date and ignores missing or invalid ones', () => {
    const rows = [
      { transactionDate: '2026-10-31' },
      { transactionDate: new Date('2026-11-03') },
      { transactionDate: 'not a date' },
      { transactionDate: null },
    ];
    expect(latestTransactionDate(rows)?.toISOString().slice(0, 10)).toBe('2026-11-03');
    expect(latestTransactionDate([])).toBeUndefined();
    expect(latestTransactionDate(undefined)).toBeUndefined();
  });
});
