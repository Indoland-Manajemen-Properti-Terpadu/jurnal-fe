// hooks/useDetailAccount.ts
import { API_ACCOUNT } from '@/services/endpoint';
import { get, patch } from '@/services/apiClient';
import { DetailAccountModel } from '../types/DetailAccountModel';

export const getDetailAccount = async (idAccount: string): Promise<DetailAccountModel> => {
  const result = await get(`${API_ACCOUNT.GET_DETAIL_ACCOUNT}/${idAccount}`);
  return result;
};

export const archiveAccount = async (accountId: string): Promise<any> => {
  const url = API_ACCOUNT.ARCHIVE_ACCOUNT.replace(':accountId', accountId);
  const result = await patch(url, {});
  return result;
};
