import { countAccountStats, percentOf } from './accountStats';
import type { JournalAccounts } from './journalAccount';

const account = (overrides: Partial<JournalAccounts>): JournalAccounts => ({
  id: 'x',
  name: 'Akun',
  amount: 0,
  debit: 0,
  credit: 0,
  ...overrides,
});

const accounts = [
  account({
    id: 'kas',
    accountNumber: '1-10000',
    isBankAndCash: true,
    category: { name: 'Kas & Bank' },
    subAccount: [
      account({
        id: 'bca',
        accountNumber: '1-10001',
        isBankAndCash: true,
        category: { name: 'Kas & Bank' },
      }),
      account({
        id: 'lock',
        accountNumber: '1-10002',
        isLocked: 'true',
        category: { name: 'Aset Tetap' },
      }),
    ],
  }),
  account({ id: 'pen', accountNumber: '4-10000', category: { name: 'Pendapatan' } }),
  account({ id: 'nocat' }),
];

describe('countAccountStats', () => {
  it('counts accounts per class by the first digit of the code', () => {
    expect(countAccountStats(accounts).classCounts).toEqual([3, 0, 0, 1, 0, 0, 0, 0]);
  });

  it('counts sub accounts too and distinct category names', () => {
    expect(countAccountStats(accounts)).toMatchObject({
      total: 5,
      bankCash: 2,
      locked: 1,
      categoriesCount: 3,
    });
  });

  it('splits parents from sub accounts', () => {
    expect(countAccountStats(accounts)).toMatchObject({ parentCount: 1, subCount: 2 });
  });

  it('splits balance sheet from profit and loss by the first digit of the code', () => {
    // 1-xxxx counts three times, 4-xxxx once, an account without a code in neither
    expect(countAccountStats(accounts)).toMatchObject({ balanceSheetCount: 3, profitLossCount: 1 });
  });

  it('is zero for an empty list', () => {
    expect(countAccountStats([])).toEqual({
      total: 0,
      parentCount: 0,
      subCount: 0,
      bankCash: 0,
      locked: 0,
      categoriesCount: 0,
      balanceSheetCount: 0,
      profitLossCount: 0,
      classCounts: [0, 0, 0, 0, 0, 0, 0, 0],
    });
  });
});

describe('percentOf', () => {
  it('rounds to a whole percent and never divides by zero', () => {
    expect(percentOf(36, 200)).toBe(18);
    expect(percentOf(1, 3)).toBe(33);
    expect(percentOf(5, 0)).toBe(0);
  });
});
