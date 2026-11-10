import { groupByAccountClass, type AccountClass } from '@/module/reports/domain/accountClass';
import type { TrialBalanceAccount } from '@/module/reports/domain/trialBalance.types';

/** Keeps the accounts whose number or name holds the search text (case-insensitive). */
export const filterTrialBalanceAccounts = (
  accounts: TrialBalanceAccount[],
  search: string
): TrialBalanceAccount[] => {
  const query = search.trim().toLowerCase();
  if (!query) return accounts;
  return accounts.filter(
    (account) =>
      account.accountNumber.toLowerCase().includes(query) ||
      account.name.toLowerCase().includes(query)
  );
};

export interface TrialBalanceSection {
  key: AccountClass;
  accounts: TrialBalanceAccount[];
}

/**
 * The accounts the table shows: the ones that carry a balance of their own. A parent account
 * (`isHead`) only works as a category over its sub accounts and adds them up, so it is left out;
 * the totals from the server count the same accounts.
 */
export const detailTrialBalanceAccounts = (
  accounts: TrialBalanceAccount[]
): TrialBalanceAccount[] => accounts.filter((account) => !account.isHead);

/** Groups accounts by account class, in chart order, leaving out the classes with no account. */
export const groupTrialBalanceAccounts = (accounts: TrialBalanceAccount[]): TrialBalanceSection[] =>
  groupByAccountClass(accounts, (account) => account.accountNumber).map((group) => ({
    key: group.key,
    accounts: group.items,
  }));
