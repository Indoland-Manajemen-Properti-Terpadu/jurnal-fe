import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import { GetReconciliationModel } from '../types/GetReconciliationModel';

export const GetReconciliation = (idAccount: string) => {
  return useQuery<GetReconciliationModel>({
    queryKey: ['get_reconciliation', idAccount],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_RECONCILIATION}${idAccount}`);
      return result.data;
    },
    enabled: !!idAccount,
    retry: false,
  });
};
