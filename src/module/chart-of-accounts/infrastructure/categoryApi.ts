import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT } from '@/lib/http/endpoints';
import type { CategoryAccountModel } from '@/module/chart-of-accounts/domain/categoryAccount';

/** An account offered as a head or sub account of a category. */
export interface CategoryAccountRef {
  id: string;
  accountNumber: string;
  name: string;
}

export interface CategoryInfo {
  suggestedAccountNumber: string;
  possibleSubAccounts: CategoryAccountRef[];
  possibleHeadAccounts: CategoryAccountRef[];
}

export const fetchCategoryAccounts = async (): Promise<CategoryAccountModel[]> => {
  const response = await apiClient.get<CategoryAccountModel[]>(API_ACCOUNT.GET_CATEGORY_ACCOUNT);
  return response.data;
};

/** The endpoint answers `{ data: CategoryInfo }`. */
export const fetchCategoryInfo = async (categoryId: string): Promise<CategoryInfo> => {
  const response = await apiClient.get<{ data: CategoryInfo }>(
    `${API_ACCOUNT.GET_CATEGORY_INFO}/${categoryId}`
  );
  return response.data.data;
};
