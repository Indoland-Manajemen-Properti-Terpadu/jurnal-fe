import { useQuery } from '@tanstack/react-query';
import type { ReturnListParams } from '../../domain/saleReturn';
import { fetchReturn, fetchReturns } from '../../infrastructure/saleReturnApi';

export const returnKeys = {
  all: ['sales', 'returns'] as const,
  lists: () => [...returnKeys.all, 'list'] as const,
  list: (params: ReturnListParams) => [...returnKeys.lists(), params] as const,
  detail: (id: string) => [...returnKeys.all, 'detail', id] as const,
};

export const useReturns = (params: ReturnListParams = {}) =>
  useQuery({
    queryKey: returnKeys.list(params),
    queryFn: () => fetchReturns(params),
    staleTime: 30_000,
  });

export const useReturn = (id?: string) =>
  useQuery({
    queryKey: returnKeys.detail(id || ''),
    queryFn: () => fetchReturn(id || ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
