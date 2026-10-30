import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import { fetchPaymentTerms, fetchContacts } from '@/module/Contact/infrastructure/contactApi';
import { fetchProducts, fetchTaxes } from '@/module/products';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import type {
  CreateSaleFormValues,
  CreateSalePaymentPayload,
  SaleListParams,
} from '../../domain/sale';
import {
  createSale,
  createSalePayment,
  downloadInvoicePdf,
  fetchPaymentMethods,
  fetchSaleDetail,
  fetchSales,
  generateInvoiceLink,
  getApiErrorMessage,
} from '../../infrastructure/saleApi';

const tr = (key: string, params?: Record<string, string | number>) => t(key, params, 'sales');

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params: SaleListParams) => [...saleKeys.lists(), params] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  paymentMethods: () => ['sales', 'payment-methods'] as const,
  paymentDetail: (id: string) => ['sales', 'payment-detail', id] as const,
  customers: () => ['sales', 'customers'] as const,
  products: () => ['sales', 'products'] as const,
  taxes: () => ['sales', 'taxes'] as const,
  paymentTerms: () => ['sales', 'payment-terms'] as const,
  depositAccounts: () => ['sales', 'deposit-accounts'] as const,
};

export const useSales = (params: SaleListParams = {}) =>
  useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => fetchSales(params),
    staleTime: 30_000,
  });

export const useSaleDetail = (id?: string) =>
  useQuery({
    queryKey: saleKeys.detail(id || ''),
    queryFn: () => fetchSaleDetail(id || ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateSaleFormValues) => createSale(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      notifications.show({
        color: 'teal',
        title: tr('notify.createdTitle'),
        message: tr('notify.createdMessage', { number: data.transactionNumber }),
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: tr('notify.createFailedTitle'),
        message: getApiErrorMessage(err, tr('notify.createFailedFallback')),
      });
    },
  });
};

export const useCreateSalePayment = (saleId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateSalePaymentPayload) => createSalePayment(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      if (saleId) {
        queryClient.invalidateQueries({ queryKey: saleKeys.detail(saleId) });
      }
      notifications.show({
        color: 'teal',
        title: tr('notify.paidTitle'),
        message: tr('notify.paidMessage'),
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: tr('notify.payFailedTitle'),
        message: getApiErrorMessage(err, tr('notify.payFailedFallback')),
      });
    },
  });
};

export const useGenerateInvoiceLink = () =>
  useMutation({
    mutationFn: (id: string) => generateInvoiceLink(id),
    onSuccess: () => {
      notifications.show({
        color: 'teal',
        title: tr('notify.linkTitle'),
        message: tr('notify.linkMessage'),
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: tr('notify.linkFailedTitle'),
        message: getApiErrorMessage(err, tr('notify.linkFailedFallback')),
      });
    },
  });

export const useDownloadInvoicePdf = () =>
  useMutation({
    mutationFn: async ({ id, filename }: { id: string; filename: string }) => {
      const blob = await downloadInvoicePdf(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || `Invoice-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: tr('notify.downloadFailedTitle'),
        message: getApiErrorMessage(err, tr('notify.downloadFailedFallback')),
      });
    },
  });

/* Form dropdown lookups */
export const usePaymentMethods = () =>
  useQuery({
    queryKey: saleKeys.paymentMethods(),
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60_000,
  });

export const useSaleCustomerOptions = () =>
  useQuery({
    queryKey: saleKeys.customers(),
    queryFn: async () => {
      const res = await fetchContacts({ page: 1, limit: 100 });
      return res.items.map((c) => ({
        value: c.id,
        label: c.displayName,
        emails: c.emails,
        billingAddress: c.addresses?.billing?.general || '',
      }));
    },
    staleTime: 5 * 60_000,
  });

export const useSaleProductOptions = () =>
  useQuery({
    queryKey: saleKeys.products(),
    queryFn: async () => {
      const res = await fetchProducts({ page: 1, limit: 100 });
      return res.items.map((p) => ({
        value: p.id,
        code: p.sku || p.externalCode || '',
        price: p.sellingInfo?.unitPrice || 0,
        name: p.name,
      }));
    },
    staleTime: 5 * 60_000,
  });

export const useSaleTaxes = () =>
  useQuery({
    queryKey: saleKeys.taxes(),
    queryFn: fetchTaxes,
    staleTime: 5 * 60_000,
  });

export const useSalePaymentTerms = () =>
  useQuery({
    queryKey: saleKeys.paymentTerms(),
    queryFn: fetchPaymentTerms,
    staleTime: 5 * 60_000,
  });

export const useDepositAccounts = () =>
  useQuery({
    queryKey: saleKeys.depositAccounts(),
    queryFn: async () => {
      const accounts = await getJournalAccounts();
      return accounts.map((acc) => ({
        value: acc.id,
        label: `${acc.accountNumber || ''} - ${acc.name}`,
        isBankAndCash: Boolean(acc.isBankAndCash),
      }));
    },
    staleTime: 5 * 60_000,
  });
