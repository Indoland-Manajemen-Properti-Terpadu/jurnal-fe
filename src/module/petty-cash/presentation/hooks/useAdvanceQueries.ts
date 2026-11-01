import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type {
  AdvanceRecord,
  AdvanceStatusInfo,
  Page,
} from '@/module/petty-cash/domain/pettyCashEntities';
import {
  getAdvance,
  getAdvanceStatusOf,
  getMyAdvanceStatus,
  listAdvances,
  type AdvanceListParams,
} from '@/module/petty-cash/infrastructure/pettyCashAdvanceApi';
import type { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';

export const useAdvances = (params: AdvanceListParams = {}) => {
  const scope = usePettyCashScope();
  return useQuery<Page<AdvanceRecord>, PettyCashError>({
    queryKey: pettyCashKeys.advanceList(scope, params),
    queryFn: () => listAdvances(params),
    placeholderData: keepPreviousData,
  });
};

export const useAdvance = (advanceId: string | undefined) => {
  const scope = usePettyCashScope();
  return useQuery<AdvanceRecord, PettyCashError>({
    queryKey: pettyCashKeys.advance(scope, advanceId ?? ''),
    queryFn: () => getAdvance(advanceId as string),
    enabled: Boolean(advanceId),
    retry: (count, error) => error.code !== 'NOT_FOUND' && count < 2,
  });
};

/** The signed-in user's own standing (`me`), or another user's when a controller looks one up. */
export const useAdvanceStatus = (userId: string | 'me' | undefined) => {
  const scope = usePettyCashScope();
  return useQuery<AdvanceStatusInfo, PettyCashError>({
    queryKey: pettyCashKeys.advanceStatus(scope, userId ?? ''),
    queryFn: () => (userId === 'me' ? getMyAdvanceStatus() : getAdvanceStatusOf(userId as string)),
    enabled: Boolean(userId),
  });
};
