import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import {
  createSale,
  createSalePayment,
  downloadInvoicePdf,
  fetchPaymentMethods,
  fetchSaleDetail,
  fetchSalePaymentDetail,
  fetchSales,
  generateInvoiceLink,
  getApiErrorMessage,
} from '@/module/sales/infrastructure/saleApi';
import type { CreateSaleFormValues, CreateSalePaymentPayload, SaleListParams } from '@/module/sales/domain/sale';
import { fetchPaymentTerms, fetchContacts } from '@/module/Contact/infrastructure/contactApi';
import { fetchProducts, fetchTaxes } from '@/module/products';
import { getJournalAccounts } from '@/module/chart-of-accounts';

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

export const useSales = (params: SaleListParams = {}) => {
  return useQuery({
    queryKey: saleKeys.list(params),
    queryFn: () => fetchSales(params),
    staleTime: 30_000,
  });
};

export const useSaleDetail = (id?: string) => {
  return useQuery({
    queryKey: saleKeys.detail(id || ''),
    queryFn: () => fetchSaleDetail(id || ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: CreateSaleFormValues) => createSale(values),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() });
      notifications.show({
        color: 'teal',
        title: 'Faktur Berhasil Dibuat',
        message: `Faktur penjualan ${data.transactionNumber} berhasil dicatat di sistem.`,
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: 'Gagal Membuat Faktur',
        message: getApiErrorMessage(err, 'Terjadi kesalahan saat menyimpan faktur.'),
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
        title: 'Pembayaran Diterima',
        message: 'Pembayaran faktur berhasil disimpan dan dicatat ke kas/bank.',
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: 'Gagal Memproses Pembayaran',
        message: getApiErrorMessage(err, 'Terjadi kesalahan saat mencatat pembayaran.'),
      });
    },
  });
};

export const useGenerateInvoiceLink = () => {
  return useMutation({
    mutationFn: (id: string) => generateInvoiceLink(id),
    onSuccess: (link) => {
      notifications.show({
        color: 'teal',
        title: 'Tautan Invoice Dibuat',
        message: 'Tautan faktur online berhasil digenerate.',
      });
    },
    onError: (err) => {
      notifications.show({
        color: 'red',
        title: 'Gagal Membuat Tautan',
        message: getApiErrorMessage(err, 'Tidak dapat mengenerate tautan invoice.'),
      });
    },
  });
};

export const useDownloadInvoicePdf = () => {
  return useMutation({
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
        title: 'Gagal Mengunduh Faktur',
        message: getApiErrorMessage(err, 'File faktur PDF tidak dapat diunduh.'),
      });
    },
  });
};

/* Form dropdown lookups */
export const usePaymentMethods = () => {
  return useQuery({
    queryKey: saleKeys.paymentMethods(),
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60_000,
  });
};

export const useSaleCustomerOptions = () => {
  return useQuery({
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
};

export const useSaleProductOptions = () => {
  return useQuery({
    queryKey: saleKeys.products(),
    queryFn: async () => {
      const res = await fetchProducts({ page: 1, limit: 100 });
      return res.items.map((p) => ({
        value: p.id,
        label: `${p.name} (${p.sku || p.externalCode || 'Tanpa Kode'})`,
        price: p.sellingInfo?.unitPrice || 0,
        name: p.name,
      }));
    },
    staleTime: 5 * 60_000,
  });
};

export const useSaleTaxes = () => {
  return useQuery({
    queryKey: saleKeys.taxes(),
    queryFn: fetchTaxes,
    staleTime: 5 * 60_000,
  });
};

export const useSalePaymentTerms = () => {
  return useQuery({
    queryKey: saleKeys.paymentTerms(),
    queryFn: fetchPaymentTerms,
    staleTime: 5 * 60_000,
  });
};

export const useDepositAccounts = () => {
  return useQuery({
    queryKey: saleKeys.depositAccounts(),
    queryFn: async () => {
      const accounts = await getJournalAccounts();
      // Filter for Kas & Bank or active accounts
      return accounts.map((acc: any) => ({
        value: acc.id,
        label: `${acc.accountNumber || ''} - ${acc.name}`,
        isBankAndCash: Boolean(acc.isBankAndCash),
      }));
    },
    staleTime: 5 * 60_000,
  });
};
