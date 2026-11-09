import type { AssetSortKey, AssetSortOrder } from '@/module/assets/domain/asset';

export const ASSET_SORT_OPTIONS = [
  { value: 'newest', sortBy: 'createdAt', sortOrder: 'desc' },
  { value: 'name_asc', sortBy: 'name', sortOrder: 'asc' },
  { value: 'code_asc', sortBy: 'code', sortOrder: 'asc' },
  { value: 'date_desc', sortBy: 'acquisitionDate', sortOrder: 'desc' },
  { value: 'cost_desc', sortBy: 'acquisitionCost', sortOrder: 'desc' },
  { value: 'nbv_desc', sortBy: 'netBookValue', sortOrder: 'desc' },
] as const satisfies ReadonlyArray<{
  value: string;
  sortBy: AssetSortKey;
  sortOrder: AssetSortOrder;
}>;

export type AssetSortValue = (typeof ASSET_SORT_OPTIONS)[number]['value'];

export const DEFAULT_ASSET_SORT: AssetSortValue = 'newest';

export const resolveAssetSort = (value: string | null) =>
  ASSET_SORT_OPTIONS.find((option) => option.value === value) ??
  ASSET_SORT_OPTIONS.find((option) => option.value === DEFAULT_ASSET_SORT)!;
