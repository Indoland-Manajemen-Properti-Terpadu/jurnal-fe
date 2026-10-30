import { countAccountStats, filterAccountsByTab } from './accountStats';
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
    isBankAndCash: true,
    category: { name: 'Kas & Bank' },
    subAccount: [
      account({ id: 'bca', isBankAndCash: true, category: { name: 'Kas & Bank' } }),
      account({ id: 'lock', isLocked: 'true', category: { name: 'Aset Tetap' } }),
    ],
  }),
  account({ id: 'pen', category: { name: 'Pendapatan' } }),
  account({ id: 'nocat' }),
];

describe('countAccountStats', () => {
  it('counts sub accounts too and distinct category names', () => {
    expect(countAccountStats(accounts)).toEqual({
      total: 5,
      bankCash: 2,
      locked: 1,
      categoriesCount: 3,
    });
  });

  it('is zero for an empty list', () => {
    expect(countAccountStats([])).toEqual({ total: 0, bankCash: 0, locked: 0, categoriesCount: 0 });
  });
});

describe('filterAccountsByTab', () => {
  it('filters the top level by tab and keeps all for any other value', () => {
    expect(filterAccountsByTab(accounts, 'kas_bank').map((a) => a.id)).toEqual(['kas']);
    expect(filterAccountsByTab(accounts, 'locked')).toEqual([]);
    expect(filterAccountsByTab(accounts, 'all')).toBe(accounts);
  });
});
