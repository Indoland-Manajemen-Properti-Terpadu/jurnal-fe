import { useQuery } from '@tanstack/react-query';
import { useJournalAccountStore } from '@/store/GeneralJournal/useJournalAccount';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { getJournalAccounts } from '@/module/GeneralJournal/JournalAccount/services/AccountJournal.service';

export const useJournalAccounts = (showArchived: boolean = false) => {
  const { accounts, setAccounts } = useJournalAccountStore();

  const { data, isLoading, isError, refetch } = useQuery<JournalAccounts[]>({
    queryKey: ['accounts', showArchived],
    queryFn: () => getJournalAccounts(showArchived ? { showArchived: 1 } : {}),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    meta: {
      onSuccess: (queryData: JournalAccounts[]) => {
        setAccounts(queryData);
      },
    },
  });

  return {
    accounts: data || accounts || [],
    isLoading,
    isError,
    isEmpty: !(data || accounts)?.length,
    refetch,
  };
};
