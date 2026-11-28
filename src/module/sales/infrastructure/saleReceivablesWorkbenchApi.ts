import apiClient from '@/lib/http/apiClient';
import type {
  ReceivableCustomerDetail,
  ReceivableCustomerRow,
  ReceivableInvoiceRow,
  ReceivableListParams,
  ReceivablesOverview,
  ReceivablesPage,
  ReceivableView,
} from '../domain/saleReceivables';

const BASE = '/v1/sales/receivables/workbench';
type Envelope<T> = { data: T };

const withParams = (params: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== '')
  );

export const fetchReceivablesOverview = async (asOf: string): Promise<ReceivablesOverview> => {
  const { data } = await apiClient.get<Envelope<ReceivablesOverview>>(BASE, { params: { asOf } });
  return data.data;
};

export const fetchReceivableCustomers = async (
  params: ReceivableListParams
): Promise<ReceivablesPage<ReceivableCustomerRow>> => {
  const { data } = await apiClient.get<Envelope<ReceivablesPage<ReceivableCustomerRow>>>(
    `${BASE}/customers`,
    { params: withParams(params) }
  );
  return data.data;
};

export const fetchReceivableInvoices = async (
  params: ReceivableListParams
): Promise<ReceivablesPage<ReceivableInvoiceRow>> => {
  const { data } = await apiClient.get<Envelope<ReceivablesPage<ReceivableInvoiceRow>>>(
    `${BASE}/invoices`,
    { params: withParams(params) }
  );
  return data.data;
};

export const fetchReceivableCustomerDetail = async (customerId: string) => {
  const { data } = await apiClient.get<Envelope<ReceivableCustomerDetail>>(
    `${BASE}/customers/${customerId}`
  );
  return data.data;
};

export const downloadReceivablesCsv = async (
  view: ReceivableView,
  params: Omit<ReceivableListParams, 'page' | 'limit'>
): Promise<Blob> => {
  const response = await apiClient.get(`${BASE}/export`, {
    params: withParams({ ...params, view }),
    responseType: 'blob',
  });
  return response.data;
};
