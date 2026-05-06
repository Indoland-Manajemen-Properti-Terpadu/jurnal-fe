// hooks/useDetailAccount.ts
import { API_ACCOUNT } from '@/services/endpoint';
import { get } from '@/services/apiClient';
import { DetailAccountModel } from '../types/DetailAccountModel';

export const getDetailAccount = async (idAccount: string): Promise<DetailAccountModel> => {
  const result = await get(`${API_ACCOUNT.GET_DETAIL_ACCOUNT}/${idAccount}`);
  return result;
};
