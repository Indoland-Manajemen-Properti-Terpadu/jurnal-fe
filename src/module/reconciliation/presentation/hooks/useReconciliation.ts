import { useQuery } from '@tanstack/react-query';
import { fetchReconciliation } from '../../infrastructure/reconciliationApi';
import { reconciliationKeys } from './reconciliationKeys';

export const useReconciliation = (idAccount: string) =>
  useQuery({
    queryKey: reconciliationKeys.byAccount(idAccount),
    queryFn: () => fetchReconciliation(idAccount),
    enabled: !!idAccount,
    retry: false,
  });
