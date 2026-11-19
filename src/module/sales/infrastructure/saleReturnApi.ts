import apiClient from '@/lib/http/apiClient';
import type { SaleDocPage } from '../domain/saleDocument';
import type { ReturnListParams, ReturnSummary, SaleReturn } from '../domain/saleReturn';
import type { ReturnFormValues } from '../domain/saleReturnForm';
import type { SaleDocPageDto } from './saleDocDto';
import { mapDocPage } from './saleDocMapper';
import type { ReturnSummaryDto, SaleReturnDto } from './saleReturnDto';
import { mapReturnDto, mapReturnSummary } from './saleReturnMapper';
import {
  buildApplyBody,
  buildRefundBody,
  buildReturnCreateBody,
  buildReturnUpdateBody,
  type ApplyCreditInput,
  type RefundInput,
} from './saleReturnPayloads';

export const RETURN_ENDPOINTS = {
  returns: '/v1/sale-returns',
  detail: (id: string) => `/v1/sale-returns/${id}`,
  post: (id: string) => `/v1/sale-returns/${id}/post`,
  print: (id: string) => `/v1/sale-returns/${id}/print`,
  void: (id: string) => `/v1/sale-returns/${id}/void`,
  apply: (id: string) => `/v1/sale-returns/${id}/apply`,
  voidApplication: (id: string, applicationId: string) =>
    `/v1/sale-returns/${id}/applications/${applicationId}/void`,
  refund: (id: string) => `/v1/sale-returns/${id}/refund`,
  voidRefund: (id: string) => `/v1/sale-returns/${id}/refund/void`,
} as const;

type Envelope<T> = { code: number; message: string; data: T };

export const fetchReturns = async (
  params: ReturnListParams = {}
): Promise<SaleDocPage<SaleReturn, ReturnSummary>> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const { data } = await apiClient.get<Envelope<SaleDocPageDto<SaleReturnDto, ReturnSummaryDto>>>(
    RETURN_ENDPOINTS.returns,
    {
      params: {
        page,
        limit,
        tab: params.tab || undefined,
        customer: params.customer || undefined,
        sale: params.sale || undefined,
        search: params.search?.trim() || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortBy ? params.sortOrder : undefined,
      },
    }
  );
  return mapDocPage(data.data, mapReturnDto, mapReturnSummary, { page, limit });
};

export const fetchReturn = async (id: string): Promise<SaleReturn> => {
  const { data } = await apiClient.get<Envelope<SaleReturnDto>>(RETURN_ENDPOINTS.detail(id));
  return mapReturnDto(data.data);
};

export const createReturn = async (values: ReturnFormValues): Promise<SaleReturn> => {
  const { data } = await apiClient.post<Envelope<SaleReturnDto>>(
    RETURN_ENDPOINTS.returns,
    buildReturnCreateBody(values)
  );
  return mapReturnDto(data.data);
};

export const updateReturn = async (id: string, values: ReturnFormValues): Promise<SaleReturn> => {
  const { data } = await apiClient.put<Envelope<SaleReturnDto>>(
    RETURN_ENDPOINTS.detail(id),
    buildReturnUpdateBody(values)
  );
  return mapReturnDto(data.data);
};

export const deleteReturn = async (id: string): Promise<void> => {
  await apiClient.delete(RETURN_ENDPOINTS.detail(id));
};

const transition = async (url: string, body?: object): Promise<SaleReturn> => {
  const { data } = await apiClient.post<Envelope<SaleReturnDto>>(url, body);
  return mapReturnDto(data.data);
};

/** Issues a draft: the journal is posted and the invoice is updated. */
export const postReturn = (id: string) => transition(RETURN_ENDPOINTS.post(id));
export const voidReturn = (id: string, reason: string) =>
  transition(RETURN_ENDPOINTS.void(id), { reason });
export const applyReturnCredit = (id: string, input: ApplyCreditInput) =>
  transition(RETURN_ENDPOINTS.apply(id), buildApplyBody(input));
export const voidReturnApplication = (id: string, applicationId: string) =>
  transition(RETURN_ENDPOINTS.voidApplication(id, applicationId));
export const refundReturn = (id: string, input: RefundInput) =>
  transition(RETURN_ENDPOINTS.refund(id), buildRefundBody(input));
export const voidReturnRefund = (id: string) => transition(RETURN_ENDPOINTS.voidRefund(id));

export const downloadReturnPdf = async (id: string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(RETURN_ENDPOINTS.print(id), { responseType: 'blob' });
  return data;
};
