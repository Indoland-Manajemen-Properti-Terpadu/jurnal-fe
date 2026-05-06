import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';

interface TransactionByAccountParams {
  idAccount: string;
  expenditure: boolean;
}

export const GetTransactionByAccountRecon = (idAccount: string, expenditure: boolean) => {
  return useQuery<TransactionByAccountRecon[]>({
    queryKey: ['transaction_by_account', idAccount, expenditure],
    queryFn: async () => {
      const params = new URLSearchParams({
        sortBy: 'transactionDate',
        expenditure: String(expenditure),
      });
      const result = await get(
        `${API_ACCOUNT.GET_TRANSACTION_BY_ACCOUNT}/${idAccount}/reconcile?${params}`
      );
      return result.data.results;
    },

    enabled: !!idAccount,
  });
};
