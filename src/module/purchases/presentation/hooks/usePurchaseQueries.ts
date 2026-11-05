import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { PurchaseAccessProfile } from '@/module/purchases/domain/purchaseAccess';
import type {
  Page,
  PartyRef,
  PaymentMethodRef,
  ProductRef,
  TaxRef,
} from '@/module/purchases/domain/purchaseCommon';
import type {
  GoodsReceipt,
  PayablesAging,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseReturn,
  VendorCredits,
} from '@/module/purchases/domain/purchaseDocuments';
import {
  getBill,
  getOrder,
  getPayablesAging,
  getPayment,
  getReceipt,
  getRequest,
  getReturn,
  getVendorCredits,
  listBills,
  listOrders,
  listPayments,
  listReceipts,
  listRequests,
  listReturns,
  type ListParams,
} from '@/module/purchases/infrastructure/purchaseApi';
import type { PurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import {
  getAccessProfile,
  listPaymentMethods,
  listPaymentTerms,
  listTaxes,
  searchPurchasableProducts,
  searchSuppliers,
} from '@/module/purchases/infrastructure/purchaseLookupApi';
import {
  purchaseKeys,
  type DocumentKind,
} from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';

const STABLE_MS = 5 * 60 * 1000;

/** An unknown id is a 404 answer, not a transient failure worth retrying. */
const retryUnlessNotFound = (count: number, error: PurchaseError) =>
  error.kind !== 'notFound' && count < 2;

const useList = <T>(
  kind: DocumentKind,
  params: ListParams,
  fetch: (params: ListParams) => Promise<Page<T>>,
  enabled = true
) => {
  const scope = usePurchaseScope();
  return useQuery<Page<T>, PurchaseError>({
    queryKey: purchaseKeys.list(scope, kind, params),
    queryFn: () => fetch(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};

const useDetail = <T>(
  kind: DocumentKind,
  id: string | undefined,
  fetch: (id: string) => Promise<T>
) => {
  const scope = usePurchaseScope();
  return useQuery<T, PurchaseError>({
    queryKey: purchaseKeys.detail(scope, kind, id ?? ''),
    queryFn: () => fetch(id as string),
    enabled: Boolean(id),
    retry: retryUnlessNotFound,
  });
};

export const usePurchaseAccessProfile = () => {
  const scope = usePurchaseScope();
  return useQuery<PurchaseAccessProfile, PurchaseError>({
    queryKey: purchaseKeys.access(scope),
    queryFn: getAccessProfile,
    staleTime: STABLE_MS,
  });
};

export const useRequests = (params: ListParams, enabled?: boolean) =>
  useList<PurchaseRequest>('requests', params, listRequests, enabled);
export const useRequest = (id?: string) => useDetail<PurchaseRequest>('requests', id, getRequest);

export const useOrders = (params: ListParams, enabled?: boolean) =>
  useList<PurchaseOrder>('orders', params, listOrders, enabled);
export const useOrder = (id?: string) => useDetail<PurchaseOrder>('orders', id, getOrder);

export const useReceipts = (params: ListParams, enabled?: boolean) =>
  useList<GoodsReceipt>('receipts', params, listReceipts, enabled);
export const useReceipt = (id?: string) => useDetail<GoodsReceipt>('receipts', id, getReceipt);

export const useBills = (params: ListParams, enabled?: boolean) =>
  useList<PurchaseBill>('bills', params, listBills, enabled);
export const useBill = (id?: string) => useDetail<PurchaseBill>('bills', id, getBill);

export const usePayments = (params: ListParams, enabled?: boolean) =>
  useList<PaymentVoucher>('payments', params, listPayments, enabled);
export const usePayment = (id?: string) => useDetail<PaymentVoucher>('payments', id, getPayment);

export const useReturns = (params: ListParams, enabled?: boolean) =>
  useList<PurchaseReturn>('returns', params, listReturns, enabled);
export const useReturn = (id?: string) => useDetail<PurchaseReturn>('returns', id, getReturn);

export const useVendorCredits = (vendor: string | undefined) => {
  const scope = usePurchaseScope();
  return useQuery<VendorCredits, PurchaseError>({
    queryKey: purchaseKeys.credits(scope, vendor ?? ''),
    queryFn: () => getVendorCredits(vendor as string),
    enabled: Boolean(vendor),
  });
};

export const usePayablesAging = (params: { asOf?: string; vendor?: string }, enabled = true) => {
  const scope = usePurchaseScope();
  return useQuery<PayablesAging, PurchaseError>({
    queryKey: purchaseKeys.aging(scope, params),
    queryFn: () => getPayablesAging(params),
    enabled,
    placeholderData: keepPreviousData,
  });
};

export const useSupplierOptions = (search: string) => {
  const scope = usePurchaseScope();
  return useQuery<PartyRef[], PurchaseError>({
    queryKey: purchaseKeys.suppliers(scope, search),
    queryFn: () => searchSuppliers(search),
    staleTime: STABLE_MS,
    placeholderData: keepPreviousData,
  });
};

export const useProductOptions = (search: string) => {
  const scope = usePurchaseScope();
  return useQuery<ProductRef[], PurchaseError>({
    queryKey: purchaseKeys.products(scope, search),
    queryFn: () => searchPurchasableProducts(search),
    staleTime: STABLE_MS,
    placeholderData: keepPreviousData,
  });
};

export const useTaxOptions = () => {
  const scope = usePurchaseScope();
  return useQuery<TaxRef[], PurchaseError>({
    queryKey: [...purchaseKeys.lookups(scope), 'taxes'],
    queryFn: listTaxes,
    staleTime: STABLE_MS,
  });
};

export const usePaymentMethodOptions = () => {
  const scope = usePurchaseScope();
  return useQuery<PaymentMethodRef[], PurchaseError>({
    queryKey: [...purchaseKeys.lookups(scope), 'payment-methods'],
    queryFn: listPaymentMethods,
    staleTime: STABLE_MS,
  });
};

export const usePaymentTermOptions = () => {
  const scope = usePurchaseScope();
  return useQuery({
    queryKey: [...purchaseKeys.lookups(scope), 'payment-terms'],
    queryFn: listPaymentTerms,
    staleTime: STABLE_MS,
  });
};
