import { API_ACCOUNT } from '@/services/endpoint';
import apiClient from '@/lib/http/apiClient';
import { DetailAccountModel } from '../domain/accountDetail';

/** Account detail. Rejects on an HTTP error (R3); the body is returned as is (see `unwrapAccountDetail`). */
export const getDetailAccount = async (idAccount: string): Promise<DetailAccountModel> => {
  const response = await apiClient.get(`${API_ACCOUNT.GET_DETAIL_ACCOUNT}/${idAccount}`, {
    params: undefined,
  });
  return response.data;
};

/** Archive or restore an account. Rejects on an HTTP error (R3). */
export const archiveAccount = async (accountId: string): Promise<unknown> => {
  const url = API_ACCOUNT.ARCHIVE_ACCOUNT.replace(':accountId', accountId);
  const response = await apiClient.patch(url, {});
  return response.data;
};
