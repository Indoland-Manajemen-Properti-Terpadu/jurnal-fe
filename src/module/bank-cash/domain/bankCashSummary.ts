import { fromMinor, sumMinor } from '@/lib/money/money';
import type { JournalAccounts } from '@/module/chart-of-accounts';

/** Heuristic bank versus cash split by category or account name (kept exactly as the page had it). */
export const isBankAccount = (account: JournalAccounts): boolean => {
  const name = (account.name || '').toLowerCase();
  const categoryName = (account.category?.name || '').toLowerCase();
  return (
    categoryName.includes('bank') ||
    name.includes('bank') ||
    name.includes('bca') ||
    name.includes('mandiri') ||
    name.includes('bri') ||
    name.includes('bni') ||
    name.includes('cimb') ||
    name.includes('permata') ||
    name.includes('danamon') ||
    name.includes('bsi') ||
    name.includes('giro') ||
    name.includes('rekening')
  );
};

/** Balance of an account in whole cents; a missing or non-numeric amount counts as zero. */
const balanceCents = (account: JournalAccounts): number => {
  const amount = Number(account.amount) || 0;
  return Math.round(Number((amount * 100).toPrecision(15)));
};

const totalOf = (accounts: JournalAccounts[]): number =>
  Number(fromMinor(sumMinor(accounts.map(balanceCents))));

export function summarizeBankCashAccounts(accounts: JournalAccounts[]) {
  const managedAccounts = (accounts || []).filter((account) => account.isBankAndCash);
  const bankAccounts = managedAccounts.filter(isBankAccount);
  const cashAccounts = managedAccounts.filter((account) => !isBankAccount(account));
  const totalBankBalance = totalOf(bankAccounts);
  const totalCashBalance = totalOf(cashAccounts);

  return {
    totalLiquidity: Number(
      fromMinor(sumMinor([...bankAccounts, ...cashAccounts].map(balanceCents)))
    ),
    totalBankBalance,
    totalCashBalance,
    bankAccountCount: bankAccounts.length,
    cashAccountCount: cashAccounts.length,
    accountCount: managedAccounts.length,
  };
}
