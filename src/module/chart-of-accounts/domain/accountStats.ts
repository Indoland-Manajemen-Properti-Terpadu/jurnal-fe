import type { JournalAccounts } from './journalAccount';

export interface AccountStats {
  total: number;
  /** Accounts that have sub accounts. */
  parentCount: number;
  /** Accounts that sit under another one. */
  subCount: number;
  bankCash: number;
  locked: number;
  categoriesCount: number;
  /** Accounts whose code starts with 1 to 3 (balance sheet). */
  balanceSheetCount: number;
  /** Accounts whose code starts with 4 to 8 (profit and loss). */
  profitLossCount: number;
  /** Accounts per class, index 0 is class 1 and index 7 is class 8 (first digit of the code). */
  classCounts: number[];
}

export const ACCOUNT_CLASS_COUNT = 8;

/** The first digit of the code decides the statement: 1-3 balance sheet, 4-8 profit and loss. */
const statementOf = (accountNumber: string | undefined): 'balanceSheet' | 'profitLoss' | null => {
  const digit = Number(accountNumber?.trim().charAt(0));
  if (digit >= 1 && digit <= 3) return 'balanceSheet';
  if (digit >= 4 && digit <= 8) return 'profitLoss';
  return null;
};

/** Counts parent and sub accounts for the overview; `categoriesCount` is distinct names. */
export const countAccountStats = (accounts: JournalAccounts[]): AccountStats => {
  const stats: AccountStats = {
    total: 0,
    parentCount: 0,
    subCount: 0,
    bankCash: 0,
    locked: 0,
    categoriesCount: 0,
    balanceSheetCount: 0,
    profitLossCount: 0,
    classCounts: Array.from({ length: ACCOUNT_CLASS_COUNT }, () => 0),
  };
  const categories = new Set<string>();

  const countAccount = (account: JournalAccounts, isSub: boolean) => {
    stats.total += 1;
    if (isSub) stats.subCount += 1;
    if (account.isBankAndCash) stats.bankCash += 1;
    if (account.isLocked) stats.locked += 1;
    if (account.category?.name) categories.add(account.category.name);
    const digit = Number(account.accountNumber?.trim().charAt(0));
    if (digit >= 1 && digit <= ACCOUNT_CLASS_COUNT) stats.classCounts[digit - 1] += 1;
    const statement = statementOf(account.accountNumber);
    if (statement === 'balanceSheet') stats.balanceSheetCount += 1;
    if (statement === 'profitLoss') stats.profitLossCount += 1;
    if (Array.isArray(account.subAccount) && account.subAccount.length > 0) {
      stats.parentCount += 1;
      account.subAccount.forEach((child) => countAccount(child, true));
    }
  };

  accounts.forEach((account) => countAccount(account, false));
  stats.categoriesCount = categories.size;
  return stats;
};

/** Share of `part` in `total` as a whole percent; 0 when there is nothing to divide by. */
export const percentOf = (part: number, total: number): number =>
  total > 0 ? Math.round((part / total) * 100) : 0;
