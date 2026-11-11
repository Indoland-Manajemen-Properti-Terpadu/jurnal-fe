import { useQuery } from '@tanstack/react-query';
import { fetchContact, fetchPaymentTerms, fetchContacts } from '@/module/contacts';
import { fetchProducts, fetchTaxes } from '@/module/products';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import type { SaleListParams } from '../../domain/sale';
import type { CustomerSummary } from '../../domain/saleCustomer';
import type { SalePaymentListParams } from '../../domain/salePaymentList';
import { depositAccountOptions } from '../../domain/saleDeposit';
import {
  fetchOverpaymentAccount,
  fetchPaymentMethods,
  fetchPublicInvoice,
  fetchSaleDetail,
  fetchSaleTags,
  fetchSalePayments,
  fetchSales,
} from '../../infrastructure/saleApi';
import {
  fetchReceivablesSummary,
  fetchSaleStatusCounts,
  type ReceivablesRange,
  type StatusCountFilters,
} from '../../infrastructure/saleReceivablesApi';

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (params: SaleListParams) => [...saleKeys.lists(), params] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
  paymentMethods: () => ['sales', 'payment-methods'] as const,
  paymentList: (params: SalePaymentListParams) => ['sales', 'payment-list', params] as const,
  paymentDetail: (id: string) => ['sales', 'payment-detail', id] as const,
  products: () => ['sales', 'products'] as const,
  taxes: () => ['sales', 'taxes'] as const,
  paymentTerms: () => ['sales', 'payment-terms'] as const,
  depositAccounts: () => ['sales', 'deposit-accounts'] as const,
  tags: () => ['sales', 'tags'] as const,
  customerSearch: (search: string) => ['sales', 'customer-search', search] as const,
  customer: (id: string) => ['sales', 'customer', id] as const,
  overpaymentAccount: () => ['sales', 'overpayment-account'] as const,
  receivables: (range: ReceivablesRange) => [...saleKeys.all, 'receivables', range] as const,
  counts: (filters: StatusCountFilters) => [...saleKeys.all, 'counts', filters] as const,
  publicInvoice: (token: string) => ['sales', 'public', token] as const,
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

/* Form dropdown lookups */
export const usePaymentMethods = () =>
  useQuery({
    queryKey: saleKeys.paymentMethods(),
    queryFn: fetchPaymentMethods,
    staleTime: 5 * 60_000,
  });

const toCustomerSummary = (c: {
  id: string;
  displayName: string;
  emails?: string[];
  addresses?: { billing?: { general?: string | null } } | null;
}): CustomerSummary => ({
  id: c.id,
  name: c.displayName,
  emails: (c.emails ?? []).filter(Boolean),
  billingAddress: c.addresses?.billing?.general || '',
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
        unit: p.unit ?? '',
        taxId: p.sellingInfo?.salesTax ?? '',
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

/** Cash and bank accounts only (headers expand to their sub-accounts). */
export const useDepositAccounts = () =>
  useQuery({
    queryKey: saleKeys.depositAccounts(),
    queryFn: async () => depositAccountOptions(await getJournalAccounts()),
    staleTime: 5 * 60_000,
  });

export const useSaleTagOptions = () =>
  useQuery({
    queryKey: saleKeys.tags(),
    queryFn: fetchSaleTags,
    staleTime: 5 * 60_000,
  });

export const useSaleReceivables = (range: ReceivablesRange) =>
  useQuery({
    queryKey: saleKeys.receivables(range),
    queryFn: () => fetchReceivablesSummary(range),
    staleTime: 30_000,
  });

export const useSaleStatusCounts = (filters: StatusCountFilters) =>
  useQuery({
    queryKey: saleKeys.counts(filters),
    queryFn: () => fetchSaleStatusCounts(filters),
    staleTime: 30_000,
  });

export const usePublicInvoice = (token?: string) =>
  useQuery({
    queryKey: saleKeys.publicInvoice(token || ''),
    queryFn: () => fetchPublicInvoice(token || ''),
    enabled: Boolean(token),
    retry: false,
  });

/** The account an overpayment is booked to; only asked for while the payment form needs it. */
export const useOverpaymentAccount = (enabled: boolean) =>
  useQuery({
    queryKey: saleKeys.overpaymentAccount(),
    queryFn: fetchOverpaymentAccount,
    enabled,
    staleTime: 60_000,
  });

export const useSalePayments = (params: SalePaymentListParams) =>
  useQuery({
    queryKey: saleKeys.paymentList(params),
    queryFn: () => fetchSalePayments(params),
    staleTime: 30_000,
  });

/** Customers matching what was typed, 20 at a time; with nothing typed, the first 20. */
export const useCustomerSearch = (search: string) =>
  useQuery({
    queryKey: saleKeys.customerSearch(search),
    queryFn: async () => {
      const res = await fetchContacts({ page: 1, limit: 20, search });
      return res.items.map(toCustomerSummary);
    },
    staleTime: 60_000,
    placeholderData: (previous) => previous,
  });

/** One customer by id, for a selection whose name is not in the search results. */
export const useCustomerById = (id: string | null, enabled: boolean) =>
  useQuery({
    queryKey: saleKeys.customer(id ?? ''),
    queryFn: async () => toCustomerSummary(await fetchContact(id as string)),
    enabled: enabled && Boolean(id),
    staleTime: 5 * 60_000,
  });

/** The payments of one invoice, newest first. */
export const useSalePaymentsOfSale = (saleId?: string) =>
  useQuery({
    queryKey: saleKeys.paymentList({ page: 1, limit: 100, sale: saleId }),
    queryFn: () =>
      fetchSalePayments({
        page: 1,
        limit: 100,
        sale: saleId,
        sortBy: 'paymentDate',
        sortOrder: 'desc',
      }),
    enabled: Boolean(saleId),
    staleTime: 30_000,
  });
