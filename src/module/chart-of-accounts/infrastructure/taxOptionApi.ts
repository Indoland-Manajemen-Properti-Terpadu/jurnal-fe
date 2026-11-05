import apiClient from '@/lib/http/apiClient';
import { API_SETTINGS } from '@/lib/http/endpoints';

export interface TaxOption {
  id: string;
  name: string;
  rate?: number;
}

type TaxListResponse = {
  data: { data?: TaxOption[] } | TaxOption[];
};

/** The tax list is paged (10 by default); the account form needs every tax. */
const TAX_LIMIT = 100;

/** Taxes from the tax settings, offered as the default tax of an account. */
export const fetchTaxOptions = async (): Promise<TaxOption[]> => {
  const response = await apiClient.get<TaxListResponse>(API_SETTINGS.GET_TAXES, {
    params: { limit: TAX_LIMIT },
  });
  const body = response.data?.data;
  return (Array.isArray(body) ? body : body?.data) ?? [];
};
