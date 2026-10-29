import { useQuery } from '@tanstack/react-query';
import { TransactionDetailModel } from '../../domain/journalEntryDetail';
import { getDetailTransaction } from '../../infrastructure/journalEntryApi';

export const useDetailTransaction = (idTransaction: string) => {
  const { data, isLoading, isError } = useQuery<TransactionDetailModel>({
    queryKey: ['detail_transaction', idTransaction],
    queryFn: () => getDetailTransaction(idTransaction),
    enabled: !!idTransaction,
  });

  return {
    detailTransaction: data || null,
    isLoading,
    isError,
  };
};
