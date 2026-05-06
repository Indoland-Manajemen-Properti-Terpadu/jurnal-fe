import { useQuery } from '@tanstack/react-query';
import { useJournalAccountStore } from '@/store/GeneralJournal/useJournalAccount';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { getJournalAccounts } from '@/module/GeneralJournal/JournalAccount/services/AccountJournal.service';

export const useJournalAccounts = () => {
  const { accounts, setAccounts } = useJournalAccountStore();

  const { data, isLoading, isError, refetch } = useQuery<JournalAccounts[]>({
    queryKey: ['accounts'],
    queryFn: getJournalAccounts,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !accounts,
    meta: {
      onSuccess: (queryData: JournalAccounts[]) => {
        setAccounts(queryData);
      },
    },
  });

  return {
    accounts: accounts || data || [],
    isLoading,
    isError,
    isEmpty: !(accounts || data)?.length,
    refetch,
  };
};
