import { useQuery } from '@tanstack/react-query';
import {
  fetchCategoryInfo,
  type CategoryInfo,
} from '@/module/chart-of-accounts/infrastructure/categoryApi';

export const useCategoryInfo = (categoryId?: string) =>
  useQuery<CategoryInfo>({
    queryKey: ['category_info', categoryId],
    queryFn: () => fetchCategoryInfo(categoryId as string),
    enabled: !!categoryId,
  });
