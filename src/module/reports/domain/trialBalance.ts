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

/**
 * Profit as a share of the revenue side of the profit and loss columns (their credit total),
 * or `null` when there is no revenue to compare with.
 */
export const profitMargin = (report: TrialBalanceReport): number | null => {
  const revenue = report.totals.profitLoss.credit;
  return revenue > 0 ? (report.profit / revenue) * 100 : null;
};
