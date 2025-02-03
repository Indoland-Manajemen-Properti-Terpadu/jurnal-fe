// hooks/useDetailAccount.ts
import axios from 'axios';
import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { DetailAccountModel } from '../types/DetailAccountModel';
import { get } from '@/services/apiClient';

export const getDetailAccount = (idAccount: string) => {
  const { data, isLoading, isError } = useQuery<DetailAccountModel>({
    queryKey: ['detail_account', idAccount],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_DETAIL_ACCOUNT}/${idAccount}`);
      return result;
    },
    enabled: !!idAccount,
  });

  return {
    accountDetail: data,
    isLoading,
    isError,
  };
};
