import { useMemo } from 'react';
import { useJournalAccounts, useSimpleAccounts } from '@/module/chart-of-accounts';
import { cashBankOptions } from '@/module/bank-cash/domain/cashBankAccounts';

/** What the posting forms offer: cash and bank accounts with balances, and every postable account. */
export const useCashBankChoices = () => {
  const cash = useSimpleAccounts({ isBankAndCash: true });
  const all = useSimpleAccounts();
  const { accounts: tree } = useJournalAccounts();

  const cashAccounts = useMemo(() => cashBankOptions(cash.accounts, tree), [cash.accounts, tree]);
  const sourceOptions = useMemo(
    () =>
      all.accounts.map((account) => ({
        value: account.id,
        label: `${account.accountNumber || ''} - ${account.name}`,
      })),
    [all.accounts]
  );

  return {
    cashAccounts,
    sourceOptions,
    ready: !cash.isLoading && !cash.isError,
    isError: cash.isError,
  };
};
