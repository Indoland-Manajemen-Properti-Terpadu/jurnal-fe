import { describe, expect, it } from 'vitest';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { summarizeBankCashAccounts } from './StatsBankCashGrid';

const account = (
  id: string,
  name: string,
  amount: number,
  categoryName: string,
  isBankAndCash = true
) =>
  ({
    id,
    name,
    amount,
    isBankAndCash,
    category: { name: categoryName },
  }) as JournalAccounts;

describe('summarizeBankCashAccounts', () => {
  it('summarizes only bank and cash accounts into decision-ready totals', () => {
    const summary = summarizeBankCashAccounts([
      account('bank', 'Bank BCA', 7_000_000, 'Bank'),
      account('cash', 'Kas Operasional', 3_000_000, 'Kas'),
      account('sales', 'Pendapatan', 99_000_000, 'Pendapatan', false),
    ]);

    expect(summary).toEqual({
      totalLiquidity: 10_000_000,
      totalBankBalance: 7_000_000,
      totalCashBalance: 3_000_000,
      bankAccountCount: 1,
      cashAccountCount: 1,
      accountCount: 2,
    });
  });
});
