import { useQuery } from '@tanstack/react-query';
import { DetailAccountModel } from '../../domain/accountDetail';
import { getDetailAccount } from '../../infrastructure/accountDetailApi';

export const useDetailAccount = (idAccount: string) => {
  const { data, isLoading, isError, refetch } = useQuery<DetailAccountModel>({
    queryKey: ['detail_account', idAccount],
    queryFn: () => getDetailAccount(idAccount),
    enabled: !!idAccount,
  });

  return {
    accountDetail: data,
    isLoading,
    isError,
    refetch,
  };
};
