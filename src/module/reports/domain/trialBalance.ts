import type {
  TrialBalanceAccount,
  TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';

/** Debit and credit that differ by less than a cent count as equal. */
const TOLERANCE = 0.005;

/** The closing balances match when the closing debit and credit totals are equal. */
export const isTrialBalanceBalanced = (report: TrialBalanceReport): boolean =>
  Math.abs(report.totals.closing.debit - report.totals.closing.credit) < TOLERANCE;

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
