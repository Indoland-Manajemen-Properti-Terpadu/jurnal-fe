import { fromMinor, sumMinor } from '@/lib/money/money';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { flattenCashBankAccounts } from '@/module/bank-cash/domain/cashBankAccounts';

/** Balance of an account in whole cents; a missing or non-numeric amount counts as zero. */
const balanceCents = (account: JournalAccounts): number => {
  const amount = Number(account.amount) || 0;
  return Math.round(Number((amount * 100).toPrecision(15)));
};

/** Total and count of the active Cash & Bank accounts of the tree; headers and archived accounts are left out. */
export function summarizeBankCashAccounts(accounts: JournalAccounts[]) {
  const active = flattenCashBankAccounts(accounts).filter((account) => !account.isArchived);

  return {
    total: Number(fromMinor(sumMinor(active.map(balanceCents)))),
    accountCount: active.length,
  };
}
