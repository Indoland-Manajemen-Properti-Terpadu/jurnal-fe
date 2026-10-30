import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { roundToCents } from '../domain/saleMoney';
import { mapSaleDto, mapSalePaymentDetail, mapSalePaymentMethod } from './saleMapper';
import type { SaleDto, SalePaymentDetailDto, SalePaymentMethodDto } from './saleDto';
import type {
  CreateSaleFormValues,
  CreateSalePaymentPayload,
  Paginated,
  Sale,
  SaleListParams,
  SalePaymentDetail,
  SalePaymentMethod,
} from '../domain/sale';

export const SALE_ENDPOINTS = {
  sales: '/v1/sales',
  saleDetail: (id: string) => `/v1/sales/${id}`,
  saleByTxNumber: (txNumber: string) => `/v1/sales/transaction/${txNumber}`,
  generateInvoiceLink: (id: string) => `/v1/sales/${id}/invoice-link`,
  downloadInvoice: (id: string) => `/v1/sales/${id}/print`,
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

// Nominal amounts are money and are rounded to the cent; percentages are rates and stay as typed.
const discountValuePayload = (values: CreateSaleFormValues): number =>
  values.discountType === 'nominal' ? roundToCents(values.discountValue) : values.discountValue;

const withholdingValuePayload = (values: CreateSaleFormValues): number =>
  values.withholdingType === 'nominal'
    ? roundToCents(values.withholdingValue)
    : values.withholdingValue;

/* API Calls */
export const fetchSales = async (params: SaleListParams = {}): Promise<Paginated<Sale>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<SaleDto>>>(SALE_ENDPOINTS.sales, {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search?.trim() || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
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

export const createSale = async (values: CreateSaleFormValues): Promise<Sale> => {
  const formData = new FormData();
  formData.append('customer', values.customer);

  if (values.transactionDate) formData.append('transactionDate', values.transactionDate);
  if (values.dueDate) formData.append('dueDate', values.dueDate);
  if (values.billingAddress) formData.append('billingAddress', values.billingAddress);
  if (values.transactionNumber) formData.append('transactionNumber', values.transactionNumber);
  if (values.customerRefNumber) formData.append('customerRefNumber', values.customerRefNumber);
  if (values.paymentTerm) formData.append('paymentTerm', values.paymentTerm);
  formData.append('isPriceIncludeTax', String(values.isPriceIncludeTax));

  values.emails.forEach((email) => {
    if (email.trim()) formData.append('emails[]', email.trim());
  });

  values.tags.forEach((tag) => {
    if (tag.trim()) formData.append('tags[]', tag.trim());
  });

  values.items.forEach((item, index) => {
    formData.append(`items[${index}][product]`, item.productId);
    if (item.description) formData.append(`items[${index}][description]`, item.description);
    formData.append(`items[${index}][quantity]`, String(item.quantity));
    formData.append(`items[${index}][unitPrice]`, String(roundToCents(item.unitPrice)));
    if (item.taxId) formData.append(`items[${index}][tax]`, item.taxId);
  });

  if (values.discountType && values.discountValue > 0) {
    formData.append('discountType', values.discountType);
    formData.append('discountValue', String(discountValuePayload(values)));
  }

  if (values.withholdingAccount && values.withholdingValue > 0) {
    formData.append('withholdingType', values.withholdingType);
    formData.append('withholdingValue', String(withholdingValuePayload(values)));
    formData.append('withholdingAccount', values.withholdingAccount);
  }

  if (values.message) formData.append('message', values.message);
  if (values.memo) formData.append('memo', values.memo);

  if (values.attachments && values.attachments.length > 0) {
    values.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const { data } = await apiClient.post<ApiEnvelope<SaleDto>>(SALE_ENDPOINTS.sales, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return mapSaleDto(data.data);
};

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
  const body =
    typeof payload.amount === 'number'
      ? { ...payload, amount: roundToCents(payload.amount) }
      : payload;
  const { data } = await apiClient.post<ApiEnvelope<unknown>>(SALE_ENDPOINTS.salePayments, body);
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

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};
