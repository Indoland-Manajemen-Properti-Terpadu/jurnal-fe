import apiClient from '@/lib/http/apiClient';
import type { SaleDocPage } from '../domain/saleDocument';
import type { OrderListParams, OrderSummary, SaleOrder } from '../domain/saleOrder';
import type { OrderFormValues } from '../domain/saleOrderForm';
import type { SaleDocPageDto } from './saleDocDto';
import { mapDocPage } from './saleDocMapper';
import type { OrderSummaryDto, SaleOrderDto } from './saleOrderDto';
import { mapOrderDto, mapOrderSummary } from './saleOrderMapper';
import { buildOrderBody } from './saleOrderPayloads';

export const ORDER_ENDPOINTS = {
  orders: '/v1/sale-orders',
  detail: (id: string) => `/v1/sale-orders/${id}`,
  fromQuote: (quoteId: string) => `/v1/sale-orders/from-quote/${quoteId}`,
  send: (id: string) => `/v1/sale-orders/${id}/send`,
  confirm: (id: string) => `/v1/sale-orders/${id}/confirm`,
  cancel: (id: string) => `/v1/sale-orders/${id}/cancel`,
  duplicate: (id: string) => `/v1/sale-orders/${id}/duplicate`,
} as const;

type Envelope<T> = { code: number; message: string; data: T };

export const fetchOrders = async (
  params: OrderListParams = {}
): Promise<SaleDocPage<SaleOrder, OrderSummary>> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const { data } = await apiClient.get<Envelope<SaleDocPageDto<SaleOrderDto, OrderSummaryDto>>>(
    ORDER_ENDPOINTS.orders,
    {
      params: {
        page,
        limit,
        tab: params.tab || undefined,
        customer: params.customer || undefined,
        search: params.search?.trim() || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortBy ? params.sortOrder : undefined,
      },
    }
  );
  return mapDocPage(data.data, mapOrderDto, mapOrderSummary, { page, limit });
};

export const fetchOrder = async (id: string): Promise<SaleOrder> => {
  const { data } = await apiClient.get<Envelope<SaleOrderDto>>(ORDER_ENDPOINTS.detail(id));
  return mapOrderDto(data.data);
};

export const createOrder = async (values: OrderFormValues): Promise<SaleOrder> => {
  const { data } = await apiClient.post<Envelope<SaleOrderDto>>(
    ORDER_ENDPOINTS.orders,
    buildOrderBody(values, 'create')
  );
  return mapOrderDto(data.data);
};

export const updateOrder = async (id: string, values: OrderFormValues): Promise<SaleOrder> => {
  const { data } = await apiClient.put<Envelope<SaleOrderDto>>(
    ORDER_ENDPOINTS.detail(id),
    buildOrderBody(values, 'update')
  );
  return mapOrderDto(data.data);
};

export const deleteOrder = async (id: string): Promise<void> => {
  await apiClient.delete(ORDER_ENDPOINTS.detail(id));
};

/** Copies the items and prices of an accepted quote; without a target date it is the order date. */
export const createOrderFromQuote = async (
  quoteId: string,
  targetDate?: string
): Promise<SaleOrder> => {
  const { data } = await apiClient.post<Envelope<SaleOrderDto>>(
    ORDER_ENDPOINTS.fromQuote(quoteId),
    targetDate ? { targetDate } : {}
  );
  return mapOrderDto(data.data);
};

const transition = async (url: string, body?: object): Promise<SaleOrder> => {
  const { data } = await apiClient.post<Envelope<SaleOrderDto>>(url, body);
  return mapOrderDto(data.data);
};

export const sendOrder = (id: string) => transition(ORDER_ENDPOINTS.send(id));
export const confirmOrder = (id: string) => transition(ORDER_ENDPOINTS.confirm(id));
export const cancelOrder = (id: string, reason: string) =>
  transition(ORDER_ENDPOINTS.cancel(id), { reason });
export const duplicateOrder = (id: string) => transition(ORDER_ENDPOINTS.duplicate(id));
