import { trialBalanceApi, type TrialBalanceReport } from '@/module/reports';
import type { DateRange } from '@/module/period-closing/domain/periodRules';

/** Category code of cash and bank accounts in the chart of accounts. */
const CASH_BANK_CATEGORY = 'KB';

export interface CashBankAccount {
  id: string;
  accountNumber: string;
  name: string;
}

/**
 * The trial balance of the closing range: its totals tell whether the books balance, its profit
 * and loss column is what the closing journal clears, and its cash and bank accounts are the ones
 * to reconcile first.
 */
export const fetchClosingTrialBalance = (
  range: DateRange,
  fallbackMessage: string,
  signal?: AbortSignal
): Promise<TrialBalanceReport> => trialBalanceApi.getReport(range, { fallbackMessage }, signal);

export const cashBankAccounts = (report: TrialBalanceReport | undefined): CashBankAccount[] =>
  (report?.accounts ?? [])
    .filter((account) => !account.isHead && account.categoryCode === CASH_BANK_CATEGORY)
    .map(({ id, accountNumber, name }) => ({ id, accountNumber, name }));
