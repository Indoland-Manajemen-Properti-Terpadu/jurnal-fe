import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  OPNAME_MENU,
  type OpnameInput,
  type OpnameLineChange,
  type OpnameRights,
  type OpnameStatus,
} from '@/module/inventory/domain/stockOpname';
import { useTranslation } from '@/i18n';
import { describeApiError } from '@/lib/http/apiError';
import {
  fetchMenuRights,
  NO_RIGHTS,
  type MenuRights,
} from '@/module/inventory/infrastructure/inventoryRightsApi';
import {
  createOpname,
  getJournalPreview,
  getOpname,
  getRunningOpname,
  listOpnames,
  saveOpnameLines,
  stepOpname,
  updateOpnameHeader,
  type OpnameListParams,
  type OpnameStep,
} from '@/module/inventory/infrastructure/opnameApi';
import {
  fetchOpnameAccounts,
  saveOpnameAccounts,
} from '@/module/inventory/infrastructure/opnameAccountsApi';
import {
  inventoryKeys,
  useInventoryScope,
} from '@/module/inventory/presentation/hooks/inventoryKeys';

const STABLE_MS = 60_000;
const BUSY_LOOKUP = 100;
const OPEN_STATUSES: OpnameStatus[] = ['draft', 'counting', 'pending_approval'];
const FROZEN_STATUSES: OpnameStatus[] = ['counting', 'pending_approval'];

export const useOpnames = (params: OpnameListParams = {}) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.opnameList(scope, params),
    queryFn: () => listOpnames(params),
    placeholderData: keepPreviousData,
  });
};

export const useOpname = (id: string | undefined) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.opname(scope, id ?? ''),
    queryFn: () => getOpname(id ?? ''),
    enabled: Boolean(id),
  });
};

export const useOpnameJournalPreview = (id: string | undefined, enabled: boolean) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.opnamePreview(scope, id ?? ''),
    queryFn: () => getJournalPreview(id ?? ''),
    enabled: Boolean(id) && enabled,
  });
};

/** The count that is freezing a warehouse right now, if any. */
export const useRunningOpname = (warehouseId: string | undefined) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.opnameRunning(scope, warehouseId ?? ''),
    queryFn: () => getRunningOpname(warehouseId ?? ''),
    enabled: Boolean(warehouseId),
  });
};

const holdingWarehouses = (
  items: { id: string; number: string; status: OpnameStatus; warehouse: { id: string } }[],
  statuses: OpnameStatus[]
) => {
  const held = new Map<string, { id: string; number: string }>();
  items
    .filter((item) => statuses.includes(item.status))
    .forEach((item) => held.set(item.warehouse.id, { id: item.id, number: item.number }));
  return held;
};

/** Warehouses that a count is holding right now (draft, counting or waiting), by warehouse id. */
export const useBusyWarehouses = () => {
  const { data } = useOpnames({ limit: BUSY_LOOKUP });
  return holdingWarehouses(data?.items ?? [], OPEN_STATUSES);
};

/** Warehouses frozen by a count: stock cannot be moved in or out until it is posted or cancelled. */
export const useFrozenWarehouses = () => {
  const { data } = useOpnames({ limit: BUSY_LOOKUP });
  return holdingWarehouses(data?.items ?? [], FROZEN_STATUSES);
};

export const useOpnameAccounts = () => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.opnameAccounts(scope),
    queryFn: fetchOpnameAccounts,
  });
};

const useMenuRights = (menu: string): MenuRights => {
  const scope = useInventoryScope();
  const { data } = useQuery({
    queryKey: inventoryKeys.rights(scope, menu),
    queryFn: () => fetchMenuRights(menu),
    staleTime: STABLE_MS,
  });
  return data ?? NO_RIGHTS;
};

/** What the signed-in person may do with stock counts; nothing until known. */
export const useOpnameRights = (): OpnameRights => {
  const count = useMenuRights(OPNAME_MENU.count);
  const review = useMenuRights(OPNAME_MENU.review);
  const approve = useMenuRights(OPNAME_MENU.approve);
  return {
    count: count.read || count.create || count.update,
    review: review.read || review.update,
    cancel: review.delete,
    approve: approve.update,
  };
};

/**
 * A count moves stock when it is posted or cancelled, so balances, history and warehouses all
 * refresh after any change; the count itself is replaced with the answer.
 */
export const useOpnameMutations = () => {
  const queryClient = useQueryClient();
  const scope = useInventoryScope();
  const refresh = () => queryClient.invalidateQueries({ queryKey: inventoryKeys.all(scope) });

  return {
    create: useMutation({
      mutationFn: (input: OpnameInput) => createOpname(input),
      onSuccess: refresh,
    }),
    updateHeader: useMutation({
      mutationFn: ({ id, input }: { id: string; input: Omit<OpnameInput, 'warehouse'> }) =>
        updateOpnameHeader(id, input),
      onSuccess: refresh,
    }),
    saveLines: useMutation({
      mutationFn: ({ id, changes }: { id: string; changes: OpnameLineChange[] }) =>
        saveOpnameLines(id, changes),
      onSuccess: (opname) => {
        queryClient.setQueryData(inventoryKeys.opname(scope, opname.id), opname);
        return queryClient.invalidateQueries({ queryKey: inventoryKeys.opnames(scope) });
      },
    }),
    step: useMutation({
      mutationFn: ({ id, step, reason }: { id: string; step: OpnameStep; reason?: string }) =>
        stepOpname(id, step, reason),
      onSuccess: refresh,
    }),
    saveAccounts: useMutation({
      mutationFn: (accounts: Record<string, string>) => saveOpnameAccounts(accounts),
      onSuccess: () =>
        queryClient.invalidateQueries({ queryKey: inventoryKeys.opnameAccounts(scope) }),
    }),
  };
};

export const useStockTakeErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('stockTake');
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
