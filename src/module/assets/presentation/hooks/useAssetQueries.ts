import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import type {
  ActivationValues,
  AssetFormValues,
  AssetListParams,
  DisposalValues,
} from '@/module/assets/domain/asset';
import type { AssetEditRights } from '@/module/assets/domain/assetRules';
import {
  activateAsset,
  createAsset,
  disposeAsset,
  fetchAsset,
  fetchAssetAccounts,
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
};

const REFERENCE_STALE_MS = 5 * 60 * 1000;

const tr = (key: string, params?: Record<string, string | number>) => t(key, params, 'assets');

const notifySuccess = (title: string, message: string) =>
  notifications.show({ color: 'teal', title, message });

const notifyError = (error: unknown, fallbackKey: string) =>
  notifications.show({
    color: 'red',
    title: tr('notifyErrorTitle'),
    message: getApiErrorMessage(error, tr(fallbackKey)),
  });

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

/** A write changes the list, the totals, the detail and the journals alike. */
const useInvalidateAssets = () => {
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

export const useDisposeAsset = (id: string) => {
  const invalidate = useInvalidateAssets();
  return useMutation({
    mutationFn: (values: DisposalValues) => disposeAsset(id, values),
    onSuccess: () => {
      invalidate();
      notifySuccess(tr('notifyDisposedTitle'), tr('notifyDisposed'));
    },
    onError: (error) => notifyError(error, 'notifyDisposeFailed'),
  });
};
