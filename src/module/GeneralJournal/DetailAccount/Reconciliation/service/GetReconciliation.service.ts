import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import { GetReconciliationModel } from '../types/GetReconciliationModel';

export const GetReconciliation = (idAccount: string) => {
  return useQuery<GetReconciliationModel>({
    queryKey: ['get_reconciliation', idAccount],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: '1',
        query: '',
      });

      const result = await get(`${API_ACCOUNT.GET_RECONCILIATION}/${idAccount}?${params}`);
      return result;
    },
    enabled: !!idAccount,
    retry: false,
  });
};
