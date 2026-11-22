import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { describeApiError } from '@/lib/http/apiError';
import { WAREHOUSE_MENU, type WarehouseInput } from '@/module/inventory/domain/warehouse';
import {
  fetchMenuRights,
  NO_RIGHTS,
  type MenuRights,
} from '@/module/inventory/infrastructure/inventoryRightsApi';
import {
  createWarehouse,
  deleteWarehouse,
  fetchPicOptions,
  fetchWarehouse,
  fetchWarehouseAudit,
  fetchWarehouses,
  fetchWarehouseStock,
  setDefaultWarehouse,
  setMinStock,
  setWarehouseActive,
  updateWarehouse,
  type WarehouseListParams,
} from '@/module/inventory/infrastructure/warehouseApi';
import {
  inventoryKeys,
  useInventoryScope,
} from '@/module/inventory/presentation/hooks/inventoryKeys';

const STABLE_MS = 60_000;

/** Every active warehouse of the site (the service allows 100 per page), for pictures and pickers. */
export const ALL_ACTIVE_WAREHOUSES = { status: 'active', limit: 100 } as const;

export const useWarehouseList = (params: WarehouseListParams = {}) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.warehouseList(scope, params),
    queryFn: () => fetchWarehouses(params),
    placeholderData: keepPreviousData,
  });
};

export const useWarehouse = (id: string | undefined) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.warehouse(scope, id ?? ''),
    queryFn: () => fetchWarehouse(id ?? ''),
    enabled: Boolean(id),
  });
};

export const useWarehouseStock = (id: string | undefined) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.warehouseStock(scope, id ?? ''),
    queryFn: () => fetchWarehouseStock(id ?? ''),
    enabled: Boolean(id),
  });
};

export const useWarehouseAudit = (id: string | undefined, enabled = true) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.warehouseAudit(scope, id ?? ''),
    queryFn: () => fetchWarehouseAudit(id ?? ''),
    enabled: Boolean(id) && enabled,
  });
};

export const usePicOptions = (enabled = true) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.picOptions(scope),
    queryFn: fetchPicOptions,
    staleTime: STABLE_MS,
    enabled,
  });
};

/** A safe sentence for a failed warehouse call (the server's Indonesian refusal for Indonesian readers). */
export const useWarehouseErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('warehouses');
  return (error: unknown) =>
    describeApiError(error, currentLanguage, {
      rejected: t('errors.rejected'),
      forbidden: t('errors.forbidden'),
      validation: t('errors.validation'),
      unauthorized: t('errors.unauthorized'),
      notFound: t('errors.notFound'),
      network: t('errors.network'),
      generic: t('errors.generic'),
    });
};

/** The signed-in person's rights on Stock & Warehouse; nothing is offered until they are known. */
export const useWarehouseRights = (): MenuRights => {
  const scope = useInventoryScope();
  const { data } = useQuery({
    queryKey: inventoryKeys.rights(scope, WAREHOUSE_MENU),
    queryFn: () => fetchMenuRights(WAREHOUSE_MENU),
    staleTime: STABLE_MS,
  });
  return data ?? NO_RIGHTS;
};

/** Every write refreshes the lists and the open warehouse, since counts and values move together. */
export const useWarehouseMutations = () => {
  const queryClient = useQueryClient();
  const scope = useInventoryScope();
  const refresh = () =>
    queryClient.invalidateQueries({ queryKey: inventoryKeys.warehouses(scope) });

  return {
    create: useMutation({
      mutationFn: (input: WarehouseInput) => createWarehouse(input),
      onSuccess: refresh,
    }),
    update: useMutation({
      mutationFn: ({ id, input }: { id: string; input: WarehouseInput }) =>
        updateWarehouse(id, input),
      onSuccess: refresh,
    }),
    setDefault: useMutation({
      mutationFn: (id: string) => setDefaultWarehouse(id),
      onSuccess: refresh,
    }),
    setActive: useMutation({
      mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        setWarehouseActive(id, isActive),
      onSuccess: refresh,
    }),
    setMinStock: useMutation({
      mutationFn: ({ id, productId, minQty }: { id: string; productId: string; minQty: number }) =>
        setMinStock(id, productId, minQty),
      onSuccess: refresh,
    }),
    remove: useMutation({
      mutationFn: (id: string) => deleteWarehouse(id),
      onSuccess: refresh,
    }),
  };
};
