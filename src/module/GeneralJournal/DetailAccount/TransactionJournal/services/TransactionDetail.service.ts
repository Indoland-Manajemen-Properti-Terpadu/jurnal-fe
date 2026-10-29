import { API_ACCOUNT } from '@/services/endpoint';
import { get } from '@/lib/http/apiClient';
import { TransactionDetailModel } from '../types/TransactionDetailModel';

export const getDetailTransaction = async (
  idTransaction: string
): Promise<TransactionDetailModel> => {
  const response = await get(`${API_ACCOUNT.GET_TRANSACTION_DETAIL}/${idTransaction}`);
  return response.data;
};
