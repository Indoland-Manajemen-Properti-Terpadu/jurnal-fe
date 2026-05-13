import { useQuery } from '@tanstack/react-query';
import { useJournalAccountStore } from '@/store/JurnalUmum/useJournalAccount';
import { JournalAccounts } from '@/module/JurnalUmum/AkunJurnal/types/JournalAccountModel';
import { getJournalAccounts } from '@/module/JurnalUmum/AkunJurnal/services/AccountJournal.service';

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
