// hooks/useDetailAccount.ts
import { API_ACCOUNT } from '@/services/endpoint';
import apiClient, { get } from '@/lib/http/apiClient';
import { DetailAccountModel } from '../domain/accountDetail';

export const getDetailAccount = async (idAccount: string): Promise<DetailAccountModel> => {
  const result = await get(`${API_ACCOUNT.GET_DETAIL_ACCOUNT}/${idAccount}`);
  return result;
};

/** Archive or restore an account. Rejects on an HTTP error (R3). */
export const archiveAccount = async (accountId: string): Promise<unknown> => {
  const url = API_ACCOUNT.ARCHIVE_ACCOUNT.replace(':accountId', accountId);
  const response = await apiClient.patch(url, {});
  return response.data;
};
