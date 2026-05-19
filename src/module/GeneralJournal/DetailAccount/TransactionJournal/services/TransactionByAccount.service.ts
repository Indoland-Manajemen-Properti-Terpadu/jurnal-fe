import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';
import type { TransactionByAccountModel } from '../types/TransactionByAccountModel';

interface TransactionByAccountParams {
  idAccount: string;
  sortBy: string;
}
export const GetTransactionByAccount = (idAccount: string) => {
  return useQuery<TransactionByAccountModel[]>({
    queryKey: ['transaction_by_account', idAccount, { sortBy: 'transactionNumber' }],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_TRANSACTION_BY_ACCOUNT}/${idAccount}`);
      if (result?.data?.results && Array.isArray(result.data.results)) {
        return result.data.results;
      }
      if (result?.results && Array.isArray(result.results)) {
        return result.results;
      }
      if (result?.data && Array.isArray(result.data)) {
        return result.data;
      }
      if (Array.isArray(result)) {
        return result;
      }
      return [];
    },

    enabled: !!idAccount,
  });
};
