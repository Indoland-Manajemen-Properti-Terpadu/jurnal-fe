import type { JournalAccounts } from './journalAccount';

export interface AccountStats {
  total: number;
  bankCash: number;
  locked: number;
  categoriesCount: number;
}

/** Counts parent and sub accounts for the overview cards; `categoriesCount` is distinct names. */
export const countAccountStats = (accounts: JournalAccounts[]): AccountStats => {
  let total = 0;
  let bankCash = 0;
  let locked = 0;
  const categories = new Set<string>();

  const countAccount = (account: JournalAccounts) => {
    total += 1;
    if (account.isBankAndCash) bankCash += 1;
    if (account.isLocked) locked += 1;
    if (account.category?.name) categories.add(account.category.name);
    if (Array.isArray(account.subAccount)) {
      account.subAccount.forEach(countAccount);
    }
  };

  accounts.forEach(countAccount);

  return { total, bankCash, locked, categoriesCount: categories.size };
};

export type AccountTab = 'all' | 'kas_bank' | 'locked';

/** Quick tab filter: cash/bank accounts, locked accounts, or everything. */
export const filterAccountsByTab = (
  accounts: JournalAccounts[],
  tab: string
): JournalAccounts[] => {
  if (tab === 'kas_bank') return accounts.filter((item) => item.isBankAndCash);
  if (tab === 'locked') return accounts.filter((item) => Boolean(item.isLocked));
  return accounts;
};
