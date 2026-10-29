import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import {
  createCategory,
  createProduct,
  createUnit,
  deleteCategory,
  deleteProduct,
  deleteUnit,
  fetchAccountOptions,
  fetchCategories,
  fetchProduct,
  fetchProducts,
  fetchTaxes,
  fetchUnits,
  getApiErrorMessage,
  updateProduct,
} from '@/module/products/infrastructure/productApi';
import type {
  MasterDataInput,
  ProductCategory,
  ProductFormValues,
  ProductListParams,
  ProductUnit,
} from '@/module/products/domain/product';

export const productKeys = {
  all: ['products'] as const,
  list: (params: ProductListParams) => ['products', 'list', params] as const,
  detail: (id: string) => ['products', 'detail', id] as const,
  categories: ['product-categories'] as const,
  units: ['product-units'] as const,
  taxes: ['taxes'] as const,
  accounts: ['product-account-options'] as const,
};

const tp = (key: string, params?: Record<string, string | number>) => t(key, params, 'products');

const notifySuccess = (message: string) =>
  notifications.show({ color: 'teal', title: tp('notify.successTitle'), message });

const notifyError = (error: unknown, fallback: string) =>
  notifications.show({
    color: 'red',
    title: tp('notify.errorTitle'),
    message: getApiErrorMessage(error, fallback),
  });

/* ---------- Queries ---------- */

export const useProducts = (params: ProductListParams) =>
  useQuery({
    queryKey: productKeys.list(params),
    queryFn: () => fetchProducts(params),
    placeholderData: keepPreviousData,
  });

export const useProduct = (id: string | undefined) =>
  useQuery({
    queryKey: productKeys.detail(id ?? ''),
    queryFn: () => fetchProduct(id as string),
    enabled: Boolean(id),
  });

export const useCategories = () =>
  useQuery({ queryKey: productKeys.categories, queryFn: () => fetchCategories() });

export const useUnits = () =>
  useQuery({ queryKey: productKeys.units, queryFn: () => fetchUnits() });

export const useTaxes = () =>
  useQuery({ queryKey: productKeys.taxes, queryFn: fetchTaxes, staleTime: 5 * 60_000 });

export const useAccountOptions = () =>
  useQuery({ queryKey: productKeys.accounts, queryFn: fetchAccountOptions, staleTime: 5 * 60_000 });

/* ---------- Mutations ---------- */

export const useSaveProduct = (id?: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (values: ProductFormValues) =>
      id ? updateProduct(id, values) : createProduct(values),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      notifySuccess(
        id
          ? tp('notify.productUpdated', { name: product.name })
          : tp('notify.productCreated', { name: product.name })
      );
    },
    onError: (error) => notifyError(error, tp('notify.productSaveFailed')),
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
      notifySuccess(tp('notify.productDeleted'));
    },
    onError: (error) => notifyError(error, tp('notify.productDeleteFailed')),
  });
};

const useMasterDataMutations = <T>(
  key: readonly string[],
  create: (input: MasterDataInput) => Promise<T>,
  remove: (id: string) => Promise<void>,
  labelKey: 'notify.categoryLabel' | 'notify.unitLabel'
) => {
  const queryClient = useQueryClient();
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: key });
    queryClient.invalidateQueries({ queryKey: productKeys.all });
  };
  const createMutation = useMutation({
    mutationFn: create,
    onSuccess: () => {
      invalidate();
      notifySuccess(tp('notify.masterAdded', { label: tp(labelKey) }));
    },
    onError: (error) => notifyError(error, tp('notify.masterAddFailed', { label: tp(labelKey) })),
  });
  const deleteMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      invalidate();
      notifySuccess(tp('notify.masterDeleted', { label: tp(labelKey) }));
    },
    onError: (error) =>
      notifyError(error, tp('notify.masterDeleteFailed', { label: tp(labelKey) })),
  });
  return { createMutation, deleteMutation };
};

export const useCategoryMutations = () =>
  useMasterDataMutations<ProductCategory>(
    productKeys.categories,
    createCategory,
    deleteCategory,
    'notify.categoryLabel'
  );

export const useUnitMutations = () =>
  useMasterDataMutations<ProductUnit>(
    productKeys.units,
    createUnit,
    deleteUnit,
    'notify.unitLabel'
  );
