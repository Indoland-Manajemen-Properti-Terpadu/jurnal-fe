import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { BASE_URL } from '@/services/endpoint';
import { getJournalAccounts } from '@/module/GeneralJournal/JournalAccount/services/AccountJournal.service';
import type { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import type {
  AccountOption,
  MasterDataInput,
  Paginated,
  Pagination,
  Product,
  ProductCategory,
  ProductFormValues,
  ProductListParams,
  ProductUnit,
  Tax,
} from '../types/product';

export const PRODUCT_ENDPOINTS = {
  products: '/v1/products',
  categories: '/v1/product-categories',
  units: '/v1/units',
  taxes: '/v1/taxes',
} as const;

/* ---------- DTOs ---------- */

type ApiEnvelope<T> = { code: number; message: string; data: T };
type PaginatedDto<T> = { data: T[]; pagination: Pagination };

type ProductCategoryDto = {
  id: string;
  name: string;
  description: string | null;
  categoryCode: string;
  isActive: boolean;
  createdAt: string;
};

type ProductDto = {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  external_code?: string | null;
  productCategory: ProductCategoryDto | null;
  buyingInfo?: Partial<Product['buyingInfo']>;
  sellingInfo?: Partial<Product['sellingInfo']>;
  inventoryInfo?: Partial<Product['inventoryInfo']>;
  createdAt: string;
  updatedAt: string;
};

type UnitDto = { id: string; name: string; description: string | null; createdAt: string };
type TaxDto = { id: string; name: string; rate: number };

/* ---------- Mappers ---------- */

const mapCategory = (dto: ProductCategoryDto): ProductCategory => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  categoryCode: dto.categoryCode,
  isActive: dto.isActive,
  createdAt: dto.createdAt,
});

const extractId = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'id' in val) return String((val as { id: unknown }).id);
  if (typeof val === 'object' && '_id' in val) return String((val as { _id: unknown })._id);
  return null;
};

const mapProduct = (dto: ProductDto & Record<string, any>): Product => {
  const categoryRaw = dto.productCategory || dto.category;
  return {
    id: dto.id || dto._id || '',
    name: dto.name || '',
    sku: dto.sku || dto.SKU || '',
    image: dto.image ?? null,
    externalCode: dto.external_code ?? dto.externalCode ?? null,
    category: categoryRaw
      ? {
          id: categoryRaw.id || categoryRaw._id || '',
          name: categoryRaw.name || '',
        }
      : null,
    buyingInfo: {
      isPurchased: dto.buyingInfo?.isPurchased ?? false,
      unitPrice: dto.buyingInfo?.unitPrice ?? null,
      purchaseAccount: extractId(dto.buyingInfo?.purchaseAccount),
      purchaseTax: extractId(dto.buyingInfo?.purchaseTax),
    },
    sellingInfo: {
      isSold: dto.sellingInfo?.isSold ?? false,
      unitPrice: dto.sellingInfo?.unitPrice ?? null,
      salesAccount: extractId(dto.sellingInfo?.salesAccount),
      accountReceivable: extractId(dto.sellingInfo?.accountReceivable),
      salesTax: extractId(dto.sellingInfo?.salesTax),
    },
    inventoryInfo: {
      isTracked: dto.inventoryInfo?.isTracked ?? false,
      inventoryAccount: extractId(dto.inventoryInfo?.inventoryAccount),
      minStock: dto.inventoryInfo?.minStock ?? 0,
    },
    createdAt: dto.createdAt || dto.created_at || '',
    updatedAt: dto.updatedAt || dto.updated_at || '',
  };
};

const mapPaginated = <D, T>(dto: PaginatedDto<D>, map: (d: D) => T): Paginated<T> => ({
  items: (dto.data ?? []).map(map),
  pagination: dto.pagination,
});

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

const mapUnit = (dto: UnitDto): ProductUnit => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  createdAt: dto.createdAt,
});

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
  return (data.data?.data ?? []).map((t) => ({ id: t.id, name: t.name, rate: t.rate }));
};

const flattenAccounts = (accounts: JournalAccounts[]): AccountOption[] =>
  accounts.flatMap((account) => [
    {
      id: account.id,
      label: account.accountNumber ? `${account.accountNumber} · ${account.name}` : account.name,
    },
    ...flattenAccounts(account.subAccount ?? []),
  ]);

export const fetchAccountOptions = async (): Promise<AccountOption[]> =>
  flattenAccounts(await getJournalAccounts());
