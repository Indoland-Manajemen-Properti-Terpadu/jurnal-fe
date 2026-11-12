import { describe, expect, it } from 'vitest';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { summarizeBankCashAccounts } from '@/module/bank-cash/domain/bankCashSummary';
import { demoTree } from '@/module/bank-cash/domain/cashBankAccounts.fixture';

const cash = (id: string, amount: number, extra: Partial<JournalAccounts> = {}) =>
  ({ id, name: id, amount, isBankAndCash: true, isPostable: true, ...extra }) as JournalAccounts;

describe('summarizeBankCashAccounts', () => {
  it('totals the real accounts of the tree without counting the header rollup twice', () => {
    expect(summarizeBankCashAccounts(demoTree())).toEqual({
      total: -274_596_069,
      accountCount: 6,
    });
  });

  it('leaves archived accounts out of the total and the count', () => {
    const summary = summarizeBankCashAccounts([
      cash('a', 1_000),
      cash('b', 5_000, { isArchived: true }),
    ]);
    expect(summary).toEqual({ total: 1_000, accountCount: 1 });
  });

  it('adds balances without float drift', () => {
    expect(summarizeBankCashAccounts([cash('a', 0.1), cash('b', 0.2)])).toEqual({
      total: 0.3,
      accountCount: 2,
    });
  });

  it('is zero for no accounts', () => {
    expect(summarizeBankCashAccounts([])).toEqual({ total: 0, accountCount: 0 });
  });
});
