import { useQuery } from '@tanstack/react-query';
import { getSimpleAccounts, type SimpleAccountsParams } from '../../infrastructure/accountApi';

/** Postable accounts for pickers; `isBankAndCash: true` keeps only cash and bank accounts; `type` keeps the tax accounts. The key sits under `['accounts']`, so account mutations refresh it. */
export const useSimpleAccounts = (params?: SimpleAccountsParams) => {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['accounts', 'simple', params ?? {}],
    queryFn: () => getSimpleAccounts(params),
  });
  return { accounts: data ?? [], isLoading, isError };
};
