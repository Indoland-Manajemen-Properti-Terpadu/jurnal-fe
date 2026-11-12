import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT, BASE_URL } from '@/lib/http/endpoints';
import type {
  AccountOption,
  MasterDataInput,
  Paginated,
  Product,
  ProductCategory,
  ProductFormValues,
  ProductListParams,
  ProductUnit,
  Tax,
} from '@/module/products/domain/product';
import type {
  ApiEnvelope,
  PaginatedDto,
  ProductCategoryDto,
  ProductDto,
  TaxDto,
  UnitDto,
} from './productDto';
import { mapCategory, mapPaginated, mapProduct, mapTax, mapUnit } from './productMapper';

export const PRODUCT_ENDPOINTS = {
  products: '/v1/products',
  categories: '/v1/product-categories',
  units: '/v1/units',
  taxes: '/v1/taxes',
} as const;

/** Image paths are returned relative to the API host (e.g. `uploads/x.png`). */
export const resolveProductImageUrl = (path: string | null): string | null => {
  if (!path) return null;
  if (/^https?:\/\//.test(path)) return path;
  return `${BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

/* ---------- Products ---------- */

/**
 * The service counts deleted products in `pagination.total` (a deleted product leaves the
 * rows but not the count). A page that is not full is the last one, so its real total is
 * known exactly; every other page keeps the service's figure.
 */
const withLiveTotal = (
  result: Paginated<Product>,
  { page, limit }: ProductListParams
): Paginated<Product> => {
  if (result.items.length >= limit) return result;
  const total = (page - 1) * limit + result.items.length;
  return {
    items: result.items,
    pagination: { ...result.pagination, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
  };
};

export const fetchProducts = async (params: ProductListParams): Promise<Paginated<Product>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<ProductDto>>>(
    PRODUCT_ENDPOINTS.products,
    { params: { ...params, search: params.search || undefined } }
  );
  return withLiveTotal(mapPaginated(data.data, mapProduct), params);
};

const ALL_PAGE_SIZE = 100;

/** Every product, read page by page; used where a figure must cover the whole catalog. */
export const fetchAllProducts = async (): Promise<Paginated<Product>> => {
  const first = await fetchProducts({ page: 1, limit: ALL_PAGE_SIZE });
  const rest = await Promise.all(
    Array.from({ length: Math.max(first.pagination.totalPages - 1, 0) }, (_, i) =>
      fetchProducts({ page: i + 2, limit: ALL_PAGE_SIZE })
    )
  );
  const items = [first, ...rest].flatMap((page) => page.items);
  // Every page was read, so the row count is the true total.
  return {
    items,
    pagination: {
      ...first.pagination,
      total: items.length,
      totalPages: Math.max(1, Math.ceil(items.length / ALL_PAGE_SIZE)),
    },
  };
};

export const fetchProduct = async (id: string): Promise<Product> => {
  const { data } = await apiClient.get<ApiEnvelope<ProductDto>>(
    `${PRODUCT_ENDPOINTS.products}/${id}`
  );
  return mapProduct(data.data);
};

const appendIfPresent = (form: FormData, key: string, value: string | number | null) => {
  if (value !== null && value !== '') form.append(key, String(value));
};

const toProductFormData = (values: ProductFormValues): FormData => {
  const form = new FormData();
  form.append('name', values.name.trim());
  appendIfPresent(form, 'productCategory', values.productCategory);
  appendIfPresent(form, 'sku', values.sku.trim());
  appendIfPresent(form, 'unit', values.unit);
  if (values.image) form.append('image', values.image);

  const { buyingInfo: b, sellingInfo: s, inventoryInfo: i } = values;
  form.append('buyingInfo[isPurchased]', String(b.isPurchased));
  if (b.isPurchased) {
    appendIfPresent(form, 'buyingInfo[unitPrice]', b.unitPrice);
    appendIfPresent(form, 'buyingInfo[purchaseAccount]', b.purchaseAccount);
    appendIfPresent(form, 'buyingInfo[purchaseTax]', b.purchaseTax);
  }

  form.append('sellingInfo[isSold]', String(s.isSold));
  if (s.isSold) {
    appendIfPresent(form, 'sellingInfo[unitPrice]', s.unitPrice);
    appendIfPresent(form, 'sellingInfo[salesAccount]', s.salesAccount);
    appendIfPresent(form, 'sellingInfo[accountReceivable]', s.accountReceivable);
    appendIfPresent(form, 'sellingInfo[salesTax]', s.salesTax);
  }

  form.append('inventoryInfo[isTracked]', String(i.isTracked));
  if (i.isTracked) {
    appendIfPresent(form, 'inventoryInfo[inventoryAccount]', i.inventoryAccount);
    appendIfPresent(form, 'inventoryInfo[minStock]', i.minStock);
  }
  return form;
};

export const createProduct = async (values: ProductFormValues): Promise<Product> => {
  const { data } = await apiClient.post<ApiEnvelope<ProductDto>>(
    PRODUCT_ENDPOINTS.products,
    toProductFormData(values)
  );
  return mapProduct(data.data);
};

export const updateProduct = async (id: string, values: ProductFormValues): Promise<Product> => {
  const { data } = await apiClient.put<ApiEnvelope<ProductDto>>(
    `${PRODUCT_ENDPOINTS.products}/${id}`,
    toProductFormData(values)
  );
  return mapProduct(data.data);
};

export const deleteProduct = async (id: string): Promise<void> => {
  await apiClient.delete(`${PRODUCT_ENDPOINTS.products}/${id}`);
};

/* ---------- Categories ---------- */

export const fetchCategories = async (
  page = 1,
  limit = 100
): Promise<Paginated<ProductCategory>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<ProductCategoryDto>>>(
    PRODUCT_ENDPOINTS.categories,
    { params: { page, limit } }
  );
  return mapPaginated(data.data, mapCategory);
};

export const createCategory = async (input: MasterDataInput): Promise<ProductCategory> => {
  const { data } = await apiClient.post<ApiEnvelope<ProductCategoryDto>>(
    PRODUCT_ENDPOINTS.categories,
    input
  );
  return mapCategory(data.data);
};

export const updateCategory = async (
  id: string,
  input: MasterDataInput
): Promise<ProductCategory> => {
  const { data } = await apiClient.put<ApiEnvelope<ProductCategoryDto>>(
    `${PRODUCT_ENDPOINTS.categories}/${id}`,
    input
  );
  return mapCategory(data.data);
};

export const deleteCategory = async (id: string): Promise<void> => {
  await apiClient.delete(`${PRODUCT_ENDPOINTS.categories}/${id}`);
};

/* ---------- Units ---------- */

export const fetchUnits = async (page = 1, limit = 100): Promise<Paginated<ProductUnit>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<UnitDto>>>(
    PRODUCT_ENDPOINTS.units,
    { params: { page, limit } }
  );
  return mapPaginated(data.data, mapUnit);
};

export const createUnit = async (input: MasterDataInput): Promise<ProductUnit> => {
  const { data } = await apiClient.post<ApiEnvelope<UnitDto>>(PRODUCT_ENDPOINTS.units, input);
  return mapUnit(data.data);
};

export const updateUnit = async (id: string, input: MasterDataInput): Promise<ProductUnit> => {
  const { data } = await apiClient.put<ApiEnvelope<UnitDto>>(
    `${PRODUCT_ENDPOINTS.units}/${id}`,
    input
  );
  return mapUnit(data.data);
};

export const deleteUnit = async (id: string): Promise<void> => {
  await apiClient.delete(`${PRODUCT_ENDPOINTS.units}/${id}`);
};

/* ---------- Lookups ---------- */

export const fetchTaxes = async (): Promise<Tax[]> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<TaxDto>>>(PRODUCT_ENDPOINTS.taxes, {
    params: { page: 1, limit: 100 },
  });
  return (data.data?.data ?? []).map(mapTax);
};

type SimpleAccountDto = {
  id: string;
  name: string;
  accountNumber?: string;
  normalBalance?: string;
  isPostable?: boolean;
};

/** `sales` lists the revenue accounts and `purchase` the cost accounts; none lists them all. */
export type AccountListType = 'sales' | 'purchase';

/** Postable accounts from the simple list; `normalBalance` already accounts for contra accounts. */
export const fetchAccountOptions = async (type?: AccountListType): Promise<AccountOption[]> => {
  const response = type
    ? await apiClient.get<{ data?: SimpleAccountDto[] }>(API_ACCOUNT.GET_SIMPLE_ACCOUNTS, {
        params: { type },
      })
    : await apiClient.get<{ data?: SimpleAccountDto[] }>(API_ACCOUNT.GET_SIMPLE_ACCOUNTS);
  const accounts = response.data?.data;
  if (!Array.isArray(accounts)) {
    throw new Error('Invalid simple accounts response.');
  }
  return accounts
    .filter((account) => account.isPostable !== false)
    .map((account) => ({
      id: account.id,
      label: account.accountNumber ? `${account.accountNumber} · ${account.name}` : account.name,
      isDebit:
        account.normalBalance === 'debit'
          ? true
          : account.normalBalance === 'credit'
            ? false
            : null,
    }));
};
