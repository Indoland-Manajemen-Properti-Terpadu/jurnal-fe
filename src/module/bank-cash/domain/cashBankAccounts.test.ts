import { describe, expect, it } from 'vitest';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { acc, child, demoTree } from '@/module/bank-cash/domain/cashBankAccounts.fixture';
import {
  cashBankOptions,
  flattenCashBankAccounts,
  pettyCashAccountIndex,
  transactionBlock,
} from '@/module/bank-cash/domain/cashBankAccounts';

describe('flattenCashBankAccounts', () => {
  it('returns the six real accounts, not the header, with the header name as group', () => {
    const result = flattenCashBankAccounts(demoTree());
    expect(result.map((a) => a.id)).toEqual(['a1', 'a2', 'a3', 'a4', 'a5', 'a6']);
    expect(result.every((a) => a.groupName === 'Kas dan Setara Kas')).toBe(true);
  });

  it('keeps a cash account under a non-cash header with no group', () => {
    const tree = [
      acc({
        id: 'h',
        accountNumber: '1-20000',
        isBankAndCash: false,
        isHead: true,
        isPostable: false,
        subAccount: [child('c1', '1-20001', 5)],
      }),
    ];
    expect(flattenCashBankAccounts(tree)).toMatchObject([{ id: 'c1', groupName: null }]);
  });

  it('lists a duplicated id once', () => {
    const tree = [child('x', '1-1', 1), child('x', '1-1', 1)];
    expect(flattenCashBankAccounts(tree)).toHaveLength(1);
  });

  it('drops an account flagged isHead even when isPostable is missing', () => {
    const tree = [acc({ id: 'h', accountNumber: '1-1', isHead: true, isPostable: undefined })];
    expect(flattenCashBankAccounts(tree)).toEqual([]);
  });

  it('walks two levels of nesting', () => {
    const tree = [
      acc({
        id: 'h1',
        accountNumber: '1-1',
        name: 'Grup',
        isHead: true,
        isPostable: false,
        subAccount: [
          acc({
            id: 'h2',
            accountNumber: '1-2',
            name: 'Sub grup',
            isHead: true,
            isPostable: false,
            subAccount: [child('deep', '1-3', 7)],
          }),
        ],
      }),
    ];
    expect(flattenCashBankAccounts(tree)).toMatchObject([{ id: 'deep', groupName: 'Sub grup' }]);
  });

  it('returns an empty list for missing input', () => {
    expect(flattenCashBankAccounts(undefined as unknown as JournalAccounts[])).toEqual([]);
  });
});

describe('petty cash account index', () => {
  const fund = (id: string, accountId: string, status: 'ACTIVE' | 'INACTIVE' | 'CLOSED') => ({
    id,
    name: `Dana ${id}`,
    status,
    account: { id: accountId, name: 'Kas Kecil Kasir', accountNumber: '1-10002' },
  });

  it('maps the ledger account of each fund to the fund', () => {
    const index = pettyCashAccountIndex([fund('f1', 'a2', 'ACTIVE')]);
    expect(index.get('a2')).toEqual({ fundId: 'f1', fundName: 'Dana f1' });
  });

  it('frees the account of a closed fund but keeps an inactive one', () => {
    const index = pettyCashAccountIndex([fund('f1', 'a2', 'CLOSED'), fund('f2', 'a3', 'INACTIVE')]);
    expect(index.has('a2')).toBe(false);
    expect(index.has('a3')).toBe(true);
  });

  it('blocks a petty cash account, and an archived one first', () => {
    const index = pettyCashAccountIndex([fund('f1', 'a2', 'ACTIVE')]);
    expect(transactionBlock(child('a2', '1-10002', 1), index)).toBe('pettyCash');
    expect(
      transactionBlock(acc({ id: 'a2', accountNumber: '1-10002', isArchived: true }), index)
    ).toBe('archived');
    expect(transactionBlock(child('a1', '1-10001', 1), index)).toBeNull();
  });
});

describe('cashBankOptions', () => {
  it('pairs each offered account with its balance from the tree', () => {
    const simple = [
      { id: 'a1', name: 'Kas Kecil Badan Pengelola', accountNumber: '1-10001' },
      { id: 'a3', name: 'Bank Mandiri', accountNumber: '1-10003' },
    ];
    const options = cashBankOptions(simple, demoTree());
    expect(options.map((o) => [o.id, o.amount])).toEqual([
      ['a1', 553_665_000],
      ['a3', -677_100_000],
    ]);
  });

  it('keeps an account the tree does not know, with a zero balance', () => {
    const options = cashBankOptions([{ id: 'zz', name: 'Baru', accountNumber: '1-99999' }], []);
    expect(options).toMatchObject([{ id: 'zz', name: 'Baru', amount: 0 }]);
  });
});
