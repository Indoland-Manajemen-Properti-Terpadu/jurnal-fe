import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  AccountOption,
  ActivationValues,
  AssetFormValues,
  AssetItem,
  AssetJournal,
  AssetListParams,
  AssetSummary,
  AssetTag,
  DisposalValues,
  Paginated,
} from '@/module/assets/domain/asset';
import type { AssetRepository } from '@/module/assets/domain/assetRepository';
import type { AssetEditRights } from '@/module/assets/domain/assetRules';
import type {
  AccountTreeDto,
  ApiEnvelope,
  AssetDto,
  AssetJournalDto,
  AssetSummaryDto,
  PaginatedDto,
  TagDto,
} from './assetDto';
import {
  flattenAccountOptions,
  mapAsset,
  mapJournal,
  mapPaginated,
  mapSummary,
  mapTag,
} from './assetMapper';

export const ASSET_ENDPOINTS = {
  assets: '/v1/assets',
  asset: (id: string) => `/v1/assets/${id}`,
  summary: '/v1/assets/summary',
  activate: (id: string) => `/v1/assets/${id}/activate`,
  dispose: (id: string) => `/v1/assets/${id}/dispose`,
  journals: (id: string) => `/v1/assets/${id}/journals`,
  tags: '/v1/tags',
  accounts: '/v1/accounts',
} as const;

const ACCOUNT_PAGE_SIZE = 500;
const TAG_PAGE_SIZE = 100;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

/** The activation block: empty optional fields go out as `null`, never as an empty string. */
const toActivationBody = (values: ActivationValues) => ({
  assetAccount: values.assetAccount,
  creditAccount: values.creditAccount,
  accumDeprAccount: values.accumDeprAccount || undefined,
  deprExpenseAccount: values.deprExpenseAccount || undefined,
  depreciationMethod: values.depreciationMethod,
  usefulLifeYears: values.depreciationMethod === 'none' ? 0 : values.usefulLifeYears,
  residualValue: values.residualValue,
  accumulatedDepreciation: values.accumulatedDepreciation,
  depreciationStartDate: values.depreciationStartDate || null,
});

export const fetchAssets = async (params: AssetListParams): Promise<Paginated<AssetItem>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<AssetDto>>>(
    ASSET_ENDPOINTS.assets,
    { params: { ...params, search: params.search || undefined } }
  );
  return mapPaginated(data.data, mapAsset);
};

export const fetchAsset = async (id: string): Promise<AssetItem> => {
  const { data } = await apiClient.get<ApiEnvelope<AssetDto>>(ASSET_ENDPOINTS.asset(id));
  return mapAsset(data.data);
};

export const fetchAssetSummary = async (): Promise<AssetSummary> => {
  const { data } = await apiClient.get<ApiEnvelope<AssetSummaryDto>>(ASSET_ENDPOINTS.summary);
  return mapSummary(data.data);
};

export const fetchAssetJournals = async (id: string): Promise<AssetJournal[]> => {
  const { data } = await apiClient.get<ApiEnvelope<AssetJournalDto[]>>(
    ASSET_ENDPOINTS.journals(id)
  );
  return (data.data ?? []).map(mapJournal);
};

export const fetchAssetTags = async (): Promise<AssetTag[]> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<TagDto>>>(ASSET_ENDPOINTS.tags, {
    params: { limit: TAG_PAGE_SIZE },
  });
  return (data.data?.data ?? []).map(mapTag);
};

/** Accounts a journal can post to, from the chart of accounts. */
export const fetchAssetAccounts = async (): Promise<AccountOption[]> => {
  const { data } = await apiClient.get<{ results?: AccountTreeDto[] }>(ASSET_ENDPOINTS.accounts, {
    params: { limit: ACCOUNT_PAGE_SIZE },
  });
  return flattenAccountOptions(data.results ?? []);
};

export const createAsset = async (
  values: AssetFormValues,
  activation?: ActivationValues
): Promise<AssetItem> => {
  const { data } = await apiClient.post<ApiEnvelope<AssetDto>>(ASSET_ENDPOINTS.assets, {
    code: values.code.trim(),
    name: values.name.trim(),
    categoryName: values.categoryName.trim() || undefined,
    acquisitionDate: values.acquisitionDate,
    acquisitionCost: values.acquisitionCost,
    notes: values.notes.trim() || undefined,
    tags: values.tagIds,
    activation: activation ? toActivationBody(activation) : undefined,
  });
  return mapAsset(data.data);
};

/** Sends only what `rights` lets this asset change; an edit that sends more is rejected. */
export const updateAsset = async (
  id: string,
  values: AssetFormValues,
  rights: AssetEditRights
): Promise<AssetItem> => {
  const body: Record<string, unknown> = {};
  if (rights.details) {
    body.name = values.name.trim();
    body.categoryName = values.categoryName.trim();
    body.notes = values.notes.trim() || null;
  }
  if (rights.terms) {
    body.code = values.code.trim();
    body.acquisitionDate = values.acquisitionDate;
    body.acquisitionCost = values.acquisitionCost;
  }
  if (rights.tags) body.tags = values.tagIds;
  const { data } = await apiClient.patch<ApiEnvelope<AssetDto>>(ASSET_ENDPOINTS.asset(id), body);
  return mapAsset(data.data);
};

export const activateAsset = async (id: string, values: ActivationValues): Promise<AssetItem> => {
  const { data } = await apiClient.post<ApiEnvelope<AssetDto>>(
    ASSET_ENDPOINTS.activate(id),
    toActivationBody(values)
  );
  return mapAsset(data.data);
};

export const reviseAssetActivation = async (
  id: string,
  values: ActivationValues
): Promise<AssetItem> => {
  const { data } = await apiClient.patch<ApiEnvelope<AssetDto>>(ASSET_ENDPOINTS.asset(id), {
    activation: toActivationBody(values),
  });
  return mapAsset(data.data);
};

export const disposeAsset = async (id: string, values: DisposalValues): Promise<AssetItem> => {
  const { data } = await apiClient.post<ApiEnvelope<AssetDto>>(ASSET_ENDPOINTS.dispose(id), {
    disposalDate: values.disposalDate,
    disposalPrice: values.disposalPrice,
    proceedsAccount: values.proceedsAccount || undefined,
    gainLossAccount: values.gainLossAccount || undefined,
  });
  return mapAsset(data.data);
};

export const httpAssetRepository: AssetRepository = {
  list: fetchAssets,
  get: fetchAsset,
  summary: fetchAssetSummary,
  journals: fetchAssetJournals,
  tags: fetchAssetTags,
  accounts: fetchAssetAccounts,
  create: createAsset,
  update: updateAsset,
  activate: activateAsset,
  reviseActivation: reviseAssetActivation,
  dispose: disposeAsset,
};
