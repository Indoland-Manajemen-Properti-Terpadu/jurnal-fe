import { useQuery } from '@tanstack/react-query';
import { getSimpleAccounts } from '../../infrastructure/accountApi';

/** Postable accounts for pickers. The key sits under `['accounts']`, so account mutations refresh it. */
export const useSimpleAccounts = () => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['accounts', 'simple'],
    queryFn: getSimpleAccounts,
  });
  return { accounts: data ?? [], isLoading, isError };
};
