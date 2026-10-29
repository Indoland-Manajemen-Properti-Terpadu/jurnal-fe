import { API_ACCOUNT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { CategoryAccountModel } from '../../domain/categoryAccount';

export const GetCategoryAccount = () => {
  return useQuery<CategoryAccountModel[]>({
    queryKey: ['category_account'],
    queryFn: async () => {
      const result = await get(`${API_ACCOUNT.GET_CATEGORY_ACCOUNT}`);
      return result;
    },
  });
};
