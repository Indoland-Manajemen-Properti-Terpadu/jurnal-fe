import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query';
import type { PurchaseAccessProfile } from '@/module/purchases/domain/purchaseAccess';
import type {
  NamedRef,
  Page,
  PartyRef,
  PaymentMethodRef,
  ProductRef,
  TaxRef,
  WarehouseRef,
} from '@/module/purchases/domain/purchaseCommon';
import type {
  GoodsReceipt,
  PayablesAging,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseReturn,
  VendorCredits,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PaymentRequest } from '@/module/purchases/domain/paymentRequest';
import type { BillSourceDoc } from '@/module/purchases/domain/billSources';
import type { ActivityEntry, ActivityKind } from '@/module/purchases/domain/activityLog';
import type { PurchaseBillInput } from '@/module/purchases/domain/purchaseInputs';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import {
  getActivity,
  getBill,
  getOrder,
  getPayablesAging,
  getPayment,
  getPaymentRequest,
  getReceipt,
  getRequest,
  getReturn,
  getVendorCredits,
  listBillSources,
  previewBill,
  type BillPreview,
  listBills,
  listOrders,
  listPayments,
  listPaymentRequests,
  listReceipts,
  listRequests,
  listReturns,
  type ListParams,
  type PaymentRequestListParams,
  type BillListParams,
  type ReceiptListParams,
  type RequestListParams,
} from '@/module/purchases/infrastructure/purchaseApi';
import type { PurchaseError } from '@/module/purchases/infrastructure/purchaseErrors';
import {
  getAccessProfile,
  listDepartments,
  listPaymentMethods,
  listPaymentTerms,
  listTaxes,
  searchPurchasableProducts,
  listTags,
  listUnits,
  listWarehouses,
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

export const useRequests = (params: RequestListParams, enabled?: boolean) =>
  useList<PurchaseRequest>('requests', params, listRequests, enabled);
export const useRequest = (id?: string) => useDetail<PurchaseRequest>('requests', id, getRequest);

export const useOrders = (params: ListParams, enabled?: boolean) =>
  useList<PurchaseOrder>('orders', params, listOrders, enabled);
export const useOrder = (id?: string) => useDetail<PurchaseOrder>('orders', id, getOrder);

export const useReceipts = (params: ReceiptListParams, enabled?: boolean) =>
  useList<GoodsReceipt>('receipts', params, listReceipts, enabled);
export const useReceipt = (id?: string) => useDetail<GoodsReceipt>('receipts', id, getReceipt);

export const useBills = (params: BillListParams, enabled?: boolean) =>
  useList<PurchaseBill>('bills', params, listBills, enabled);
export const useBill = (id?: string) => useDetail<PurchaseBill>('bills', id, getBill);

export const usePaymentRequests = (params: PaymentRequestListParams, enabled?: boolean) =>
  useList<PaymentRequest>('paymentRequests', params, listPaymentRequests, enabled);
export const usePaymentRequest = (id?: string) =>
  useDetail<PaymentRequest>('paymentRequests', id, getPaymentRequest);

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

export const usePaymentTermOptions = (appliesTo?: 'goods' | 'service') => {
  const scope = usePurchaseScope();
  return useQuery({
    queryKey: [...purchaseKeys.lookups(scope), 'payment-terms', appliesTo ?? 'all'],
    queryFn: () => listPaymentTerms(appliesTo),
    staleTime: STABLE_MS,
  });
};

export const useDepartmentOptions = () => {
  const scope = usePurchaseScope();
  return useQuery<NamedRef[], PurchaseError>({
    queryKey: [...purchaseKeys.lookups(scope), 'departments'],
    queryFn: listDepartments,
    staleTime: STABLE_MS,
  });
};

export const useUnitOptions = () => {
  const scope = usePurchaseScope();
  return useQuery<NamedRef[], PurchaseError>({
    queryKey: [...purchaseKeys.lookups(scope), 'units'],
    queryFn: listUnits,
    staleTime: STABLE_MS,
  });
};

export const useWarehouseOptions = () => {
  const scope = usePurchaseScope();
  return useQuery<WarehouseRef[], PurchaseError>({
    queryKey: [...purchaseKeys.lookups(scope), 'warehouses'],
    queryFn: listWarehouses,
    staleTime: STABLE_MS,
  });
};

export const useTagOptions = () => {
  const scope = usePurchaseScope();
  return useQuery<NamedRef[], PurchaseError>({
    queryKey: [...purchaseKeys.lookups(scope), 'tags'],
    queryFn: listTags,
    staleTime: STABLE_MS,
  });
};

/** Receipts or orders ready to be billed, of one vendor when given. */
export const useBillSources = (
  source: 'RECEIPT' | 'ORDER' | null,
  vendor?: string,
  purchaseOrder?: string
) => {
  const scope = usePurchaseScope();
  return useQuery<BillSourceDoc[], PurchaseError>({
    queryKey: [
      ...purchaseKeys.all(scope),
      'bill-sources',
      source,
      vendor ?? '',
      purchaseOrder ?? '',
    ],
    queryFn: () => listBillSources(source as 'RECEIPT' | 'ORDER', vendor, purchaseOrder),
    enabled: source !== null,
  });
};

/** The service's own figures for the bill being filled in; off while there is nothing to price. */
export const useBillPreview = (input: PurchaseBillInput | null) => {
  const scope = usePurchaseScope();
  return useQuery<BillPreview, PurchaseError>({
    queryKey: [...purchaseKeys.all(scope), 'bill-preview', input],
    queryFn: () => previewBill(input as PurchaseBillInput),
    enabled: input !== null,
    placeholderData: keepPreviousData,
    staleTime: 10_000,
    retry: false,
  });
};

/** The approval history of a document (who approved, rejected or cancelled it, and when). */
export const useActivity = (kind: ActivityKind, id: string | undefined) => {
  const scope = usePurchaseScope();
  return useQuery<ActivityEntry[], PurchaseError>({
    queryKey: [...purchaseKeys.all(scope), 'activity', kind, id ?? ''],
    queryFn: () => getActivity(kind, id as string),
    enabled: Boolean(id),
  });
};

/**
 * The open bills (verified or part paid) of several vendors, read one vendor at a time because the
 * service filters by one vendor. `items` has them together; `isLoading` is true while any is loading.
 */
export const useOpenBillsOfVendors = (vendorIds: readonly string[], enabled = true) => {
  const scope = usePurchaseScope();
  const results = useQueries({
    queries: vendorIds.map((vendor) => ({
      queryKey: [...purchaseKeys.all(scope), 'open-bills-of-vendor', vendor],
      queryFn: () => listBills({ vendor, status: ['VERIFIED', 'PARTIAL_PAID'], limit: 100 }),
      enabled,
    })),
  });
  return {
    items: results.flatMap((result) => result.data?.items ?? []),
    isLoading: results.some((result) => result.isLoading),
  };
};
