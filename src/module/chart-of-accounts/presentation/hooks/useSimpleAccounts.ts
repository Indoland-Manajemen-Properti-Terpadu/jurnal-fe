import { useQuery } from '@tanstack/react-query';
import { getSimpleAccounts } from '../../infrastructure/accountApi';

/** Postable accounts for pickers; `isBankAndCash: true` keeps only cash and bank accounts. The key sits under `['accounts']`, so account mutations refresh it. */
export const useSimpleAccounts = (params?: { isBankAndCash?: boolean }) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['accounts', 'simple', params ?? {}],
    queryFn: () => getSimpleAccounts(params),
  });
  return { accounts: data ?? [], isLoading, isError };
};
