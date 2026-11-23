import { useMemo } from 'react';
import { useAuthStore } from '@/store/useAuthentications';
import type {
  BalanceParams,
  CardParams,
  MovementParams,
} from '@/module/inventory/infrastructure/stockApi';
import type { OpnameListParams } from '@/module/inventory/infrastructure/opnameApi';
import type { TransferListParams } from '@/module/inventory/infrastructure/transferApi';
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
  warehouseAudit: (scope: string, id: string) =>
    [...inventoryKeys.warehouse(scope, id), 'audit'] as const,
  picOptions: (scope: string) => [...inventoryKeys.warehouses(scope), 'pic'] as const,
  stock: (scope: string) => [...inventoryKeys.all(scope), 'stock'] as const,
  balances: (scope: string, params: BalanceParams) =>
    [...inventoryKeys.stock(scope), 'balances', params] as const,
  movements: (scope: string, params: MovementParams) =>
    [...inventoryKeys.stock(scope), 'movements', params] as const,
  categories: (scope: string) => [...inventoryKeys.stock(scope), 'categories'] as const,
  productStock: (scope: string, productId: string) =>
    [...inventoryKeys.stock(scope), 'product', productId] as const,
  card: (scope: string, params: CardParams) =>
    [...inventoryKeys.stock(scope), 'card', params] as const,
  transfers: (scope: string, params: TransferListParams) =>
    [...inventoryKeys.stock(scope), 'transfers', params] as const,
  transfer: (scope: string, id: string) => [...inventoryKeys.stock(scope), 'transfer', id] as const,
  opnames: (scope: string) => [...inventoryKeys.all(scope), 'opnames'] as const,
  opnameList: (scope: string, params: OpnameListParams) =>
    [...inventoryKeys.opnames(scope), 'list', params] as const,
  opname: (scope: string, id: string) => [...inventoryKeys.opnames(scope), 'one', id] as const,
  opnamePreview: (scope: string, id: string) =>
    [...inventoryKeys.opname(scope, id), 'journal-preview'] as const,
  opnameRunning: (scope: string, warehouseId: string) =>
    [...inventoryKeys.opnames(scope), 'running', warehouseId] as const,
  opnameAccounts: (scope: string) => [...inventoryKeys.all(scope), 'opname-accounts'] as const,
};
