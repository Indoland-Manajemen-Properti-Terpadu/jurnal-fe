import { describe, expect, it } from 'vitest';
import { buildClosingPreview, type ClosingSourceAccount } from './closingPreview';

const account = (
  id: string,
  profitLoss: ClosingSourceAccount['profitLoss'],
  isHead = false
): ClosingSourceAccount => ({ id, accountNumber: id, name: `Akun ${id}`, isHead, profitLoss });

describe('buildClosingPreview', () => {
  it('reverses each revenue and expense balance and nets the profit', () => {
    const preview = buildClosingPreview([
      account('4-10000', { debit: null, credit: 1000.5 }, true),
      account('4-10001', { debit: null, credit: 1000.5 }),
      account('6-10001', { debit: 250.25, credit: null }),
      account('1-10001', null),
    ]);

    expect(preview.lines).toEqual([
      {
        accountId: '4-10001',
        accountNumber: '4-10001',
        name: 'Akun 4-10001',
        debit: 100050,
        credit: 0,
      },
      {
        accountId: '6-10001',
        accountNumber: '6-10001',
        name: 'Akun 6-10001',
        debit: 0,
        credit: 25025,
      },
    ]);
    expect(preview.totalRevenue).toBe(100050);
    expect(preview.totalExpense).toBe(25025);
    expect(preview.netProfit).toBe(75025);
  });

  it('reports a loss as a negative net and skips accounts without a balance', () => {
    const preview = buildClosingPreview([
      account('4-1', { debit: null, credit: 100 }),
      account('6-1', { debit: 300, credit: null }),
      account('6-2', { debit: 0, credit: null }),
      account('6-3', { debit: 50, credit: 50 }),
    ]);

    expect(preview.lines).toHaveLength(2);
    expect(preview.netProfit).toBe(-20000);
  });

  it('adds money in whole cents, without float drift', () => {
    const preview = buildClosingPreview([
      account('4-1', { debit: null, credit: 0.1 }),
      account('4-2', { debit: null, credit: 0.2 }),
    ]);
    expect(preview.totalRevenue).toBe(30);
  });
});
