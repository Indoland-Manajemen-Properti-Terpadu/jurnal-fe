import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDebouncedValue } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import type {
  ActivationValues,
  AssetAccountKind,
  AssetFormValues,
  AssetListParams,
} from '@/module/assets/domain/asset';
import type { AssetEditRights } from '@/module/assets/domain/assetRules';
import {
  activateAsset,
  createAsset,
  fetchAsset,
  fetchAssetAccounts,
  fetchAssetAccountsOfKind,
  fetchDisposalPreview,
  fetchAssetJournals,
  fetchAssetSummary,
  fetchAssetTags,
  fetchAssets,
  getApiErrorMessage,
  reviseAssetActivation,
  updateAsset,
} from '@/module/assets/infrastructure/assetApi';

export const assetKeys = {
  all: ['assets'] as const,
  list: (params: AssetListParams) => ['assets', 'list', params] as const,
  detail: (id: string) => ['assets', 'detail', id] as const,
  journals: (id: string) => ['assets', 'journals', id] as const,
  summary: ['assets', 'summary'] as const,
  tags: ['asset-tags'] as const,
  accounts: ['asset-accounts'] as const,
  accountsOfKind: (kind: AssetAccountKind) => ['asset-accounts', kind] as const,
  disposalPreview: (id: string, date: string, price: number) =>
    ['assets', 'disposal-preview', id, date, price] as const,
  vendors: (search: string) => ['asset-vendors', search] as const,
};

const REFERENCE_STALE_MS = 5 * 60 * 1000;

const tr = (key: string, params?: Record<string, string | number>) => t(key, params, 'assets');

const notifySuccess = (title: string, message: string) =>
  notifications.show({ color: 'teal', title, message });

/** The API words this for manual journals; here the cause is the account picked for the asset. */
const PETTY_CASH_REFUSED = /kas kecil.*(jurnal manual|tidak boleh)/i;

const notifyError = (error: unknown, fallbackKey: string) => {
  const message = getApiErrorMessage(error, tr(fallbackKey));
  notifications.show({
    color: 'red',
    title: tr('notifyErrorTitle'),
    message: PETTY_CASH_REFUSED.test(message) ? tr('errPettyCashAccount') : message,
  });
};

export const useAssets = (params: AssetListParams) =>
  useQuery({
    queryKey: assetKeys.list(params),
    queryFn: () => fetchAssets(params),
    placeholderData: keepPreviousData,
  });

export const useAsset = (id: string | undefined) =>
  useQuery({
    queryKey: assetKeys.detail(id ?? ''),
    queryFn: () => fetchAsset(id as string),
    enabled: Boolean(id),
  });

export const useAssetSummary = () =>
  useQuery({ queryKey: assetKeys.summary, queryFn: fetchAssetSummary });

export const useAssetJournals = (id: string | undefined, enabled: boolean) =>
  useQuery({
    queryKey: assetKeys.journals(id ?? ''),
    queryFn: () => fetchAssetJournals(id as string),
    enabled: Boolean(id) && enabled,
  });

export const useAssetTags = () =>
  useQuery({ queryKey: assetKeys.tags, queryFn: fetchAssetTags, staleTime: REFERENCE_STALE_MS });

/** Loaded when a form that needs accounts opens. */
export const useAssetAccounts = (enabled: boolean) =>
  useQuery({
    queryKey: assetKeys.accounts,
    queryFn: fetchAssetAccounts,
    staleTime: REFERENCE_STALE_MS,
    enabled,
  });

/** Accounts of one group, loaded when a form that needs them opens. */
export const useAssetAccountsOfKind = (kind: AssetAccountKind, enabled: boolean) =>
  useQuery({
    queryKey: assetKeys.accountsOfKind(kind),
    queryFn: () => fetchAssetAccountsOfKind(kind),
    staleTime: REFERENCE_STALE_MS,
    enabled,
  });

const PREVIEW_DEBOUNCE_MS = 400;

/**
 * What disposing the asset would book, asked of the API once the date and price stop changing.
 * The previous figure stays on screen while the next one loads.
 */
export const useDisposalPreview = (id: string, disposalDate: string, disposalPrice: number) => {
  const [debounced] = useDebouncedValue({ disposalDate, disposalPrice }, PREVIEW_DEBOUNCE_MS);
  const ready = Boolean(debounced.disposalDate) && debounced.disposalPrice >= 0;
  const query = useQuery({
    queryKey: assetKeys.disposalPreview(id, debounced.disposalDate, debounced.disposalPrice),
    queryFn: () => fetchDisposalPreview(id, debounced.disposalDate, debounced.disposalPrice),
    enabled: ready,
    placeholderData: keepPreviousData,
    retry: false,
  });
  const waiting =
    debounced.disposalDate !== disposalDate || debounced.disposalPrice !== disposalPrice;
  return { ...query, waiting };
};

/** A write changes the list, the totals, the detail and the journals alike. */
export const useInvalidateAssets = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: assetKeys.all });
};

export const useCreateAsset = () => {
  const invalidate = useInvalidateAssets();
  return useMutation({
    mutationFn: ({
      values,
      activation,
    }: {
      values: AssetFormValues;
      activation?: ActivationValues;
    }) => createAsset(values, activation),
    onSuccess: (asset) => {
      invalidate();
      notifySuccess(tr('notifySuccessTitle'), tr('notifyAssetAdded', { name: asset.name }));
    },
    onError: (error) => notifyError(error, 'notifySaveFailed'),
  });
};

export const useUpdateAsset = (id: string, rights: AssetEditRights) => {
  const invalidate = useInvalidateAssets();
  return useMutation({
    mutationFn: (values: AssetFormValues) => updateAsset(id, values, rights),
    onSuccess: (asset) => {
      invalidate();
      notifySuccess(tr('notifySuccessTitle'), tr('notifyAssetUpdated', { name: asset.name }));
    },
    onError: (error) => notifyError(error, 'notifySaveFailed'),
  });
};

export const useActivateAsset = (id: string) => {
  const invalidate = useInvalidateAssets();
  return useMutation({
    mutationFn: (values: ActivationValues) => activateAsset(id, values),
    onSuccess: (asset) => {
      invalidate();
      notifySuccess(tr('notifyActivatedTitle'), tr('notifyAssetActivated', { name: asset.name }));
    },
    onError: (error) => notifyError(error, 'notifyActivateFailed'),
  });
};

export const useReviseAsset = (id: string) => {
  const invalidate = useInvalidateAssets();
  return useMutation({
    mutationFn: (values: ActivationValues) => reviseAssetActivation(id, values),
    onSuccess: (asset) => {
      invalidate();
      notifySuccess(tr('notifySuccessTitle'), tr('notifyAssetRevised', { name: asset.name }));
    },
    onError: (error) => notifyError(error, 'notifySaveFailed'),
  });
};
