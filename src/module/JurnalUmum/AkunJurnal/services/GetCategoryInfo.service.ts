import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/services/apiClient';

interface CategoryInfoResponse {
  suggestedAccountNumber: string;
  possibleSubAccounts: any[];
  possibleHeadAccounts: any[];
}

export const useGetCategoryInfo = (categoryId?: string) => {
  return useQuery<CategoryInfoResponse>({
    queryKey: ['category_info', categoryId],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_CATEGORY_INFO}/${categoryId}`);
      return result?.data as CategoryInfoResponse;
    },
    enabled: !!categoryId,
  });
};
