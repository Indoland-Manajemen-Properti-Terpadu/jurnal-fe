import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TransactionDetailModel } from '../types/TransactionDetailModel';
import { get } from '@/services/apiClient';

export const GetDetailTransaction = (idTransaction: string) => {
  const { data, isLoading, isError } = useQuery<TransactionDetailModel>({
    queryKey: ['detail_transaction', idTransaction],
    queryFn: async () => {
      const response = await get(`${API_ACCOUNT.GET_TRANSACTION_DETAIL}/${idTransaction}`);
      console.log(response);
      return response.data;
    },
    enabled: !!idTransaction,
  });

  return {
    detailTransaction: data || null,
    isLoading,
    isError,
  };
};
