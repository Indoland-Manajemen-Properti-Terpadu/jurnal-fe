import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthentications';
import type { WarehouseListParams } from '@/module/inventory/infrastructure/warehouseApi';

/** Subject of the access token (the signed-in user); keys every inventory query. */
const readSubject = (token: string | null | undefined): string => {
  if (!token) return 'anonymous';
  try {
    const payload = token.split('.')[1] ?? '';
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const { sub } = JSON.parse(json) as { sub?: unknown };
    return typeof sub === 'string' && sub ? sub : 'anonymous';
  } catch {
    return 'anonymous';
  }
};

/** The cache of one user is never served to the next user who signs in within the same session. */
export const useInventoryScope = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useMemo(() => readSubject(accessToken), [accessToken]);
};

export const inventoryKeys = {
  all: (scope: string) => ['inventory', scope] as const,
  rights: (scope: string, menu: string) => [...inventoryKeys.all(scope), 'rights', menu] as const,
  warehouses: (scope: string) => [...inventoryKeys.all(scope), 'warehouses'] as const,
  warehouseList: (scope: string, params: WarehouseListParams) =>
    [...inventoryKeys.warehouses(scope), 'list', params] as const,
  warehouse: (scope: string, id: string) =>
    [...inventoryKeys.warehouses(scope), 'one', id] as const,
  warehouseStock: (scope: string, id: string) =>
    [...inventoryKeys.warehouse(scope, id), 'stock'] as const,
  warehouseMoves: (scope: string, id: string) =>
    [...inventoryKeys.warehouse(scope, id), 'moves'] as const,
  warehouseAudit: (scope: string, id: string) =>
    [...inventoryKeys.warehouse(scope, id), 'audit'] as const,
  picOptions: (scope: string) => [...inventoryKeys.warehouses(scope), 'pic'] as const,
};
