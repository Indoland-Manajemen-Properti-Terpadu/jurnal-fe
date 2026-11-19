import { useQuery } from '@tanstack/react-query';
import type { OrderListParams } from '../../domain/saleOrder';
import { fetchOrder, fetchOrders } from '../../infrastructure/saleOrderApi';

export const orderKeys = {
  all: ['sales', 'orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (params: OrderListParams) => [...orderKeys.lists(), params] as const,
  detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};

export const useOrders = (params: OrderListParams = {}) =>
  useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => fetchOrders(params),
    staleTime: 30_000,
  });

export const useOrder = (id?: string) =>
  useQuery({
    queryKey: orderKeys.detail(id || ''),
    queryFn: () => fetchOrder(id || ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
