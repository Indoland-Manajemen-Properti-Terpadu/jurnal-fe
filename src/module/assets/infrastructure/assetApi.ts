import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import type {
  AccountOption,
  ActivationValues,
  AssetAccountKind,
  DisposalPreview,
  AssetFormValues,
  AssetItem,
  AssetJournal,
  AssetListParams,
  AssetSummary,
  AssetTag,
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
  DisposalPreviewDto,
  PaginatedDto,
  SimpleAccountDto,
  TagDto,
} from './assetDto';
import {
  flattenAccountOptions,
  mapAsset,
  mapDisposalPreview,
  mapJournal,
  mapPaginated,
  mapSimpleAccounts,
  mapSummary,
  mapTag,
} from './assetMapper';

export const ASSET_ENDPOINTS = {
  assets: '/v1/assets',
  photos: '/v1/assets/photos',
  asset: (id: string) => `/v1/assets/${id}`,
  summary: '/v1/assets/summary',
  activate: (id: string) => `/v1/assets/${id}/activate`,
  journals: (id: string) => `/v1/assets/${id}/journals`,
  tags: '/v1/tags',
  accounts: '/v1/accounts',
  simpleAccounts: '/v1/accounts/simple',
  disposePreview: (id: string) => `/v1/assets/${id}/dispose-preview`,
} as const;

const ACCOUNT_PAGE_SIZE = 500;
const TAG_PAGE_SIZE = 100;

/** Schema validation text names a raw field in quotes (`"reason" is required`); it is never shown. */
const RAW_VALIDATION = /^"+[\w.[\]]+"+\s/;

/** The server answered and said no (a 4xx): nothing was written. A timeout or 5xx proves nothing. */
export const isRefusedByServer = (error: unknown): boolean => {
  if (!axios.isAxiosError(error)) {
    return false;
  }
  const status = error.response?.status;
  return status !== undefined && status >= 400 && status < 500;
};

/** The server answered 404: the thing is not there, as opposed to a failure to ask. */
export const isNotFoundError = (error: unknown): boolean =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim() && !RAW_VALIDATION.test(message.trim())) {
      return message;
    }
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

/** Accounts of one group (fixed assets, accumulated depreciation, depreciation expense). */
export const fetchAssetAccountsOfKind = async (
  kind: AssetAccountKind
): Promise<AccountOption[]> => {
  const { data } = await apiClient.get<ApiEnvelope<SimpleAccountDto[]>>(
    ASSET_ENDPOINTS.simpleAccounts,
    { params: { type: kind } }
  );
  return mapSimpleAccounts(data.data ?? []);
};

export const fetchDisposalPreview = async (
  id: string,
  disposalDate: string,
  disposalPrice: number
): Promise<DisposalPreview> => {
  const { data } = await apiClient.get<ApiEnvelope<DisposalPreviewDto>>(
    ASSET_ENDPOINTS.disposePreview(id),
    { params: { disposalDate, disposalPrice } }
  );
  return mapDisposalPreview(data.data);
};

/** Optional details of the form; the API reads an empty value as "nothing set". */
const toDetailFields = (values: AssetFormValues) => ({
  brand: values.brand.trim() || undefined,
  modelType: values.modelType.trim() || undefined,
  serialNumber: values.serialNumber.trim() || undefined,
  warrantyUntil: values.warrantyUntil || undefined,
  condition: values.condition || undefined,
  location: values.location.trim() || undefined,
  vendorContactId: values.vendorContactId || undefined,
  photos: values.photos.length > 0 ? values.photos : undefined,
});

/**
 * Photos go up first as files; the API answers with their links, which are then saved on the
 * asset together with the photos it already has. The content type is left to the browser.
 */
export const uploadAssetPhotos = async (files: File[]): Promise<string[]> => {
  if (files.length === 0) return [];
  const form = new FormData();
  files.forEach((file) => form.append('photos', file));
  const { data } = await apiClient.post<ApiEnvelope<{ urls?: string[] }>>(
    ASSET_ENDPOINTS.photos,
    form
  );
  return data.data.urls ?? [];
};

const withUploadedPhotos = async (values: AssetFormValues): Promise<AssetFormValues> => ({
  ...values,
  photos: [...values.photos, ...(await uploadAssetPhotos(values.photoFiles ?? []))],
  photoFiles: [],
});

export const createAsset = async (
  values: AssetFormValues,
  activation?: ActivationValues
): Promise<AssetItem> => {
  const saved = await withUploadedPhotos(values);
  const { data } = await apiClient.post<ApiEnvelope<AssetDto>>(ASSET_ENDPOINTS.assets, {
    code: values.code.trim(),
    name: values.name.trim(),
    categoryName: values.categoryName.trim() || undefined,
    acquisitionDate: values.acquisitionDate,
    acquisitionCost: values.acquisitionCost,
    notes: values.notes.trim() || undefined,
    ...toDetailFields(saved),
    tags: values.tagIds,
    activation: activation ? toActivationBody(activation) : undefined,
  });
  return mapAsset(data.data);
};

/** Sends only what `rights` lets this asset change; an edit that sends more is rejected. */
export const updateAsset = async (
  id: string,
  formValues: AssetFormValues,
  rights: AssetEditRights
): Promise<AssetItem> => {
  const values = rights.details ? await withUploadedPhotos(formValues) : formValues;
  const body: Record<string, unknown> = {};
  if (rights.details) {
    body.name = values.name.trim();
    body.categoryName = values.categoryName.trim();
    body.notes = values.notes.trim() || null;
    // An edit clears a field by sending `null`, so each one goes out even when empty.
    body.brand = values.brand.trim() || null;
    body.modelType = values.modelType.trim() || null;
    body.serialNumber = values.serialNumber.trim() || null;
    body.warrantyUntil = values.warrantyUntil || null;
    body.condition = values.condition || null;
    body.location = values.location.trim() || null;
    body.vendorContactId = values.vendorContactId || null;
    body.photos = values.photos;
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

export const httpAssetRepository: AssetRepository = {
  list: fetchAssets,
  get: fetchAsset,
  summary: fetchAssetSummary,
  journals: fetchAssetJournals,
  tags: fetchAssetTags,
  accounts: fetchAssetAccounts,
  accountsOfKind: fetchAssetAccountsOfKind,
  create: createAsset,
  update: updateAsset,
  activate: activateAsset,
  reviseActivation: reviseAssetActivation,
  disposePreview: fetchDisposalPreview,
};
