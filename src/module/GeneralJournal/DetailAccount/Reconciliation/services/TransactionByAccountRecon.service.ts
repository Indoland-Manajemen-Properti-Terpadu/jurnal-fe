import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';

interface TransactionByAccountParams {
  idAccount: string;
  expenditure: boolean;
}

export const GetTransactionByAccountRecon = (idAccount: string, expenditure: boolean) =>
  useQuery<TransactionByAccountRecon[]>({
    queryKey: ['transaction_by_account_reconcile', idAccount, expenditure],
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
