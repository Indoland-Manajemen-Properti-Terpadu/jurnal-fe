import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_ACCOUNT, BASE_URL } from '@/services/endpoint';
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

export const fetchProducts = async (params: ProductListParams): Promise<Paginated<Product>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<ProductDto>>>(
    PRODUCT_ENDPOINTS.products,
    { params: { ...params, search: params.search || undefined } }
  );
  return mapPaginated(data.data, mapProduct);
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

type AccountNodeDto = {
  id: string;
  name: string;
  accountNumber?: string;
  subAccount?: AccountNodeDto[];
};

const flattenAccounts = (accounts: AccountNodeDto[]): AccountOption[] =>
  accounts.flatMap((account) => [
    {
      id: account.id,
      label: account.accountNumber ? `${account.accountNumber} · ${account.name}` : account.name,
    },
    ...flattenAccounts(account.subAccount ?? []),
  ]);

export const fetchAccountOptions = async (): Promise<AccountOption[]> => {
  const response = await apiClient.get<{ results?: AccountNodeDto[] }>(API_ACCOUNT.GET_ALL_ACCOUNT);
  const accounts = response.data?.results;
  if (!Array.isArray(accounts)) {
    throw new Error('Invalid journal accounts response.');
  }
  return flattenAccounts(accounts);
};
