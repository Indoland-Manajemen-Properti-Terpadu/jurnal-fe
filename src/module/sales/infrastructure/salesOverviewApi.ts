import apiClient from '@/lib/http/apiClient';
import type { SalesOverview } from '../domain/salesOverview';
import { SALE_ENDPOINTS } from './saleApi';

type ApiEnvelope<T> = { code: number; message: string; data: T };

/** Sales overview for the active site in the current authorization token. */
export const fetchSalesOverview = async (): Promise<SalesOverview> => {
  const { data } = await apiClient.get<ApiEnvelope<SalesOverview>>(SALE_ENDPOINTS.overview);
  return data.data;
};
