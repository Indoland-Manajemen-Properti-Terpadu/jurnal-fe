import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { CountRecord, Page } from '@/module/petty-cash/domain/pettyCashEntities';
import {
  getCount,
  listCounts,
  type CountListParams,
} from '@/module/petty-cash/infrastructure/pettyCashCountApi';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';

export const useCounts = (params: CountListParams = {}) => {
  const scope = usePettyCashScope();
  return useQuery<Page<CountRecord>, PettyCashError>({
    queryKey: pettyCashKeys.countList(scope, params),
    queryFn: () => listCounts(params),
    placeholderData: keepPreviousData,
  });
};

export const useCount = (countId: string | undefined) => {
  const scope = usePettyCashScope();
  return useQuery<CountRecord, PettyCashError>({
    queryKey: pettyCashKeys.count(scope, countId ?? ''),
    queryFn: () => getCount(countId as string),
    enabled: Boolean(countId),
    retry: (count, error) => error.code !== 'NOT_FOUND' && count < 2,
  });
};
