import { describe, expect, it } from 'vitest';
import { withRunningBalance } from './runningBalance';

const row = (id: string, date: string, number: number, debit: number, credit: number) => ({
  id,
  transactionDate: new Date(date),
  transactionNumber: number,
  createdAt: date,
  debit,
  credit,
});

describe('withRunningBalance', () => {
  it('nets debit minus credit in date order, whatever the incoming order', () => {
    const result = withRunningBalance([
      row('c', '2026-11-03', 3, 0, 500),
      row('a', '2026-11-01', 1, 10000.3, 0),
      row('b', '2026-11-02', 2, 2000, 0),
    ]);
    expect(result.map((entry) => [entry.id, entry.balance])).toEqual([
      ['c', 11500.3],
      ['a', 10000.3],
      ['b', 12000.3],
    ]);
  });

  it('counts a row with equal debit and credit as zero', () => {
    const result = withRunningBalance([
      row('a', '2026-11-01', 1, 1000, 0),
      row('b', '2026-11-02', 2, 1000, 1000),
    ]);
    expect(result.map((entry) => entry.balance)).toEqual([1000, 1000]);
  });

  it('puts the opening balance (number 0) first on the same day', () => {
    const result = withRunningBalance([
      row('x', '2026-11-01', 5, 0, 100),
      row('open', '2026-11-01', 0, 1000, 0),
    ]);
    expect(result.find((entry) => entry.id === 'x')?.balance).toBe(900);
  });
});
