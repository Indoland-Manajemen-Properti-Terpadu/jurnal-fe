import { useQuery } from '@tanstack/react-query';
import type { ReceivableListParams } from '../../domain/saleReceivables';
import {
  fetchReceivableCustomerDetail,
  fetchReceivableCustomers,
  fetchReceivableInvoices,
  fetchReceivablesOverview,
} from '../../infrastructure/saleReceivablesWorkbenchApi';

export const receivablesWorkbenchKeys = {
  all: ['sales', 'receivables-workbench'] as const,
  overview: (asOf: string) => [...receivablesWorkbenchKeys.all, 'overview', asOf] as const,
  customers: (params: ReceivableListParams) =>
    [...receivablesWorkbenchKeys.all, 'customers', params] as const,
  invoices: (params: ReceivableListParams) =>
    [...receivablesWorkbenchKeys.all, 'invoices', params] as const,
  customer: (id: string) => [...receivablesWorkbenchKeys.all, 'customer', id] as const,
};

export const useReceivablesOverview = (asOf: string, enabled = true) =>
  useQuery({
    queryKey: receivablesWorkbenchKeys.overview(asOf),
    queryFn: () => fetchReceivablesOverview(asOf),
    enabled,
    staleTime: 30_000,
  });

export const useReceivableCustomers = (params: ReceivableListParams, enabled: boolean) =>
  useQuery({
    queryKey: receivablesWorkbenchKeys.customers(params),
    queryFn: () => fetchReceivableCustomers(params),
    enabled,
    staleTime: 30_000,
  });

export const useReceivableInvoices = (params: ReceivableListParams, enabled: boolean) =>
  useQuery({
    queryKey: receivablesWorkbenchKeys.invoices(params),
    queryFn: () => fetchReceivableInvoices(params),
    enabled,
    staleTime: 30_000,
  });

export const useReceivableCustomerDetail = (id?: string) =>
  useQuery({
    queryKey: receivablesWorkbenchKeys.customer(id || ''),
    queryFn: () => fetchReceivableCustomerDetail(id || ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
