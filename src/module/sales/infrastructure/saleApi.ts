import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { mapSaleDto, mapSalePaymentDetail, mapSalePaymentMethod } from './saleMapper';
import { buildPaymentFormData, buildSaleFormData } from './salePayloads';
import type { SaleDto, SalePaymentDetailDto, SalePaymentMethodDto } from './saleDto';
import type {
  CreateSaleFormValues,
  CreateSalePaymentPayload,
  Paginated,
  Sale,
  SaleListParams,
  SalePaymentDetail,
  SalePaymentMethod,
  SendSaleResult,
} from '../domain/sale';

export const SALE_ENDPOINTS = {
  sales: '/v1/sales',
  saleDetail: (id: string) => `/v1/sales/${id}`,
  saleByTxNumber: (txNumber: string) => `/v1/sales/transaction/${txNumber}`,
  send: (id: string) => `/v1/sales/${id}/send`,
  void: (id: string) => `/v1/sales/${id}/void`,
  generateInvoiceLink: (id: string) => `/v1/sales/${id}/invoice-link`,
  downloadInvoice: (id: string) => `/v1/sales/${id}/print`,
  publicInvoice: (token: string) => `/v1/sales/public/${token}`,
  receivablesSummary: '/v1/sales/receivables/summary',
  statusCounts: '/v1/sales/status-counts',
  salePayments: '/v1/sale-payments',
  salePaymentDetail: (id: string) => `/v1/sale-payments/${id}`,
  paymentMethods: '/v1/payment-methods',
  paymentTerms: '/v1/payment-terms',
  taxes: '/v1/taxes',
  tags: '/v1/tags',
  salesByCustomer: (contactId: string) => `/v1/sales/customer/${contactId}`,
  exportCustomerSales: (contactId: string) => `/v1/sales/customer/${contactId}/export`,
} as const;

type ApiEnvelope<T> = { code: number; message: string; data: T };
type PaginatedDto<T> = {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};
type SendDto = SaleDto & { emailSent?: boolean; emailError?: string };

const MULTIPART = { headers: { 'Content-Type': 'multipart/form-data' } };

const paymentStatusParam = (value: SaleListParams['paymentStatus']): string | undefined =>
  Array.isArray(value) ? value.join(',') : value || undefined;

const mapSendResult = (dto: SendDto | undefined): SendSaleResult => ({
  sale: mapSaleDto(dto),
  emailSent: Boolean(dto?.emailSent),
  emailError: dto?.emailError || '',
});

/* API Calls */
export const fetchSales = async (params: SaleListParams = {}): Promise<Paginated<Sale>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<SaleDto>>>(SALE_ENDPOINTS.sales, {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search?.trim() || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      paymentStatus: paymentStatusParam(params.paymentStatus),
      excludeDraft: params.excludeDraft || undefined,
      sortBy: params.sortBy || undefined,
      sortOrder: params.sortBy ? params.sortOrder : undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      customerId: params.customerId || undefined,
    },
  });

  const raw = data.data;
  const items = (raw?.data || []).map(mapSaleDto);
  return {
    items,
    pagination: {
      total: raw?.pagination?.total ?? items.length,
      page: raw?.pagination?.page ?? (params.page || 1),
      limit: raw?.pagination?.limit ?? (params.limit || 10),
      totalPages: raw?.pagination?.totalPages ?? 1,
    },
  };
};

export const fetchSaleDetail = async (id: string): Promise<Sale> => {
  const { data } = await apiClient.get<ApiEnvelope<SaleDto>>(SALE_ENDPOINTS.saleDetail(id));
  return mapSaleDto(data.data);
};

export const fetchSaleByTxNumber = async (txNumber: string): Promise<Sale> => {
  const { data } = await apiClient.get<ApiEnvelope<SaleDto>>(
    SALE_ENDPOINTS.saleByTxNumber(txNumber)
  );
  return mapSaleDto(data.data);
};

/** Creates an invoice: a draft, or a sent invoice (which also emails the customer). */
export const createSale = async (
  values: CreateSaleFormValues,
  mode: 'draft' | 'send'
): Promise<SendSaleResult> => {
  const { data } = await apiClient.post<ApiEnvelope<SendDto>>(
    SALE_ENDPOINTS.sales,
    buildSaleFormData(values, mode),
    MULTIPART
  );
  return mapSendResult(data.data);
};

/** Updates a draft; the status is never sent (the backend refuses a status change here). */
export const updateSale = async (id: string, values: CreateSaleFormValues): Promise<Sale> => {
  const { data } = await apiClient.put<ApiEnvelope<SaleDto>>(
    SALE_ENDPOINTS.saleDetail(id),
    buildSaleFormData(values, 'update'),
    MULTIPART
  );
  return mapSaleDto(data.data);
};

/** Issues a draft (journal + status) or, on an issued invoice, only resends the email. */
export const sendSale = async (id: string, sendEmail: boolean): Promise<SendSaleResult> => {
  const { data } = await apiClient.post<ApiEnvelope<SendDto>>(SALE_ENDPOINTS.send(id), {
    sendEmail,
  });
  return mapSendResult(data.data);
};

export const voidSale = async (id: string, reason: string): Promise<Sale> => {
  const { data } = await apiClient.put<ApiEnvelope<SaleDto>>(SALE_ENDPOINTS.void(id), { reason });
  return mapSaleDto(data.data);
};

export const deleteSale = async (id: string): Promise<void> => {
  await apiClient.delete(SALE_ENDPOINTS.saleDetail(id));
};

/** Public view of an invoice from its emailed link; needs no sign-in. */
export const fetchPublicInvoice = async (token: string): Promise<Sale> => {
  const { data } = await apiClient.get<ApiEnvelope<SaleDto>>(SALE_ENDPOINTS.publicInvoice(token));
  return mapSaleDto(data.data);
};

/** The backend returns the link's token, not a URL; the caller builds the address. */
export const generateInvoiceLink = async (id: string): Promise<string> => {
  const { data } = await apiClient.post<ApiEnvelope<{ invoiceLink?: string }>>(
    SALE_ENDPOINTS.generateInvoiceLink(id)
  );
  return data.data?.invoiceLink || '';
};

export const downloadInvoicePdf = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(SALE_ENDPOINTS.downloadInvoice(id), {
    responseType: 'blob',
  });
  return response.data;
};

/* Payment API */
export const createSalePayment = async (payload: CreateSalePaymentPayload): Promise<unknown> => {
  const { data } = await apiClient.post<ApiEnvelope<unknown>>(
    SALE_ENDPOINTS.salePayments,
    buildPaymentFormData(payload),
    MULTIPART
  );
  return data.data;
};

export const fetchSalePaymentDetail = async (id: string): Promise<SalePaymentDetail> => {
  const { data } = await apiClient.get<ApiEnvelope<SalePaymentDetailDto>>(
    SALE_ENDPOINTS.salePaymentDetail(id)
  );
  return mapSalePaymentDetail(data.data);
};

export const fetchPaymentMethods = async (): Promise<SalePaymentMethod[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: SalePaymentMethodDto[] }>>(
    SALE_ENDPOINTS.paymentMethods
  );
  return (data.data?.data || []).map(mapSalePaymentMethod);
};

export type SaleTagOption = { id: string; name: string; color?: string };

export const fetchSaleTags = async (): Promise<SaleTagOption[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: SaleTagOption[] }>>(
    SALE_ENDPOINTS.tags,
    { params: { limit: 100 } }
  );
  return (data.data?.data || []).map(({ id, name, color }) => ({ id, name, color }));
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};
