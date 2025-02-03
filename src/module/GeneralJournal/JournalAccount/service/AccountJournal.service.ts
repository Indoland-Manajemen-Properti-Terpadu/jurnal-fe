import { useQuery } from '@tanstack/react-query';
import { useJournalAccountStore } from '@/store/GeneralJournal/useJournalAccount';
import { API_ACCOUNT } from '@/services/endpoint';
import { get } from '@/services/apiClient';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';

export const GetJournalAccounts = () => {
  const { accounts, setAccounts } = useJournalAccountStore();

  const { data, isLoading, isError, refetch } = useQuery<JournalAccounts[]>({
    queryKey: ['accounts'],
    queryFn: async () => {
      const result = await get(API_ACCOUNT.GET_ALL_ACCOUNT);
      return result.results;
    },
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !accounts,
    meta: {
      onSuccess: (data: JournalAccounts[]) => {
        setAccounts(data);
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
