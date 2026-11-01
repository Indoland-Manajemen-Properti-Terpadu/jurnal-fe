import { useQuery } from '@tanstack/react-query';
import { JournalAccounts } from '@/module/chart-of-accounts/domain/journalAccount';
import { getJournalAccounts } from '@/module/chart-of-accounts/infrastructure/accountApi';

export const useJournalAccounts = (showArchived: boolean = false) => {
  const { data, isLoading, isError, refetch } = useQuery<JournalAccounts[]>({
    queryKey: ['accounts', showArchived],
    queryFn: () => getJournalAccounts(showArchived ? { showArchived: 1 } : {}),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });

  const accounts = data ?? [];

  return {
    accounts,
    isLoading,
    isError,
    isEmpty: !isLoading && !isError && accounts.length === 0,
    refetch,
  };
};
