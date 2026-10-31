import { useQuery } from '@tanstack/react-query';
import type { CategoryAccountModel } from '@/module/chart-of-accounts/domain/categoryAccount';
import { fetchCategoryAccounts } from '@/module/chart-of-accounts/infrastructure/categoryApi';

export const useCategoryAccounts = () =>
  useQuery<CategoryAccountModel[]>({
    queryKey: ['category_account'],
    queryFn: fetchCategoryAccounts,
  });
