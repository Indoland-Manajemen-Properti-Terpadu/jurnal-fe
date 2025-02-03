import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';

interface TransactionByAccountParams {
  idAccount: string;
  sortBy: string;
}
export const GetTransactionByAccount = (idAccount: string) => {
  return useQuery<TransactionByAccountModel[]>({
    queryKey: ['transaction_by_account', idAccount, { sortBy: 'transactionNumber' }],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_TRANSACTION_BY_ACCOUNT}/${idAccount}`);
      return result.data;
    },

    enabled: !!idAccount,
  });
};
