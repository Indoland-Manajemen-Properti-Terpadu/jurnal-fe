import type {
  TrialBalanceAccount,
  TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';

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

export interface AccountCounts {
  /** Sub accounts (everything that is not a parent). */
  detail: number;
  /** Parent accounts. */
  parents: number;
  /** Sub accounts whose closing balance is not zero. */
  withBalance: number;
}

/** Counts accounts for the summary; parents are counted apart because they only add up their children. */
export const countTrialBalanceAccounts = (accounts: TrialBalanceAccount[]): AccountCounts =>
  accounts.reduce<AccountCounts>(
    (counts, account) => {
      if (account.isHead) return { ...counts, parents: counts.parents + 1 };
      const { closing } = account;
      const hasBalance = Boolean(
        closing && ((closing.debit ?? 0) !== 0 || (closing.credit ?? 0) !== 0)
      );
      return {
        ...counts,
        detail: counts.detail + 1,
        withBalance: counts.withBalance + (hasBalance ? 1 : 0),
      };
    },
    { detail: 0, parents: 0, withBalance: 0 }
  );

/**
 * Profit as a share of the revenue side of the profit and loss columns (their credit total),
 * or `null` when there is no revenue to compare with.
 */
export const profitMargin = (report: TrialBalanceReport): number | null => {
  const revenue = report.totals.profitLoss.credit;
  return revenue > 0 ? (report.profit / revenue) * 100 : null;
};
