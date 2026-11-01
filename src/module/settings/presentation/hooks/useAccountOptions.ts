import { useEffect, useState } from 'react';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import {
  buildAccountOptions,
  type AccountLike,
  type AccountOption,
} from '@/module/settings/domain/accountOptions';

/** Chart of accounts as select options; on a load error the list stays empty. */
export const useAccountOptions = (suffixOf?: (account: AccountLike) => string) => {
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setIsAccountsLoading(true);
        const res = await getJournalAccounts();
        if (Array.isArray(res)) setAccounts(buildAccountOptions(res, suffixOf));
      } catch {
        // the selectors simply stay empty
      } finally {
        setIsAccountsLoading(false);
      }
    };
    load();
  }, []);

  return { accounts, isAccountsLoading };
};
