import { AssetCategory, AssetItem } from '@/module/assets/domain/asset';
import { toSafeNumber } from '@/module/assets/domain/depreciation';

export type AssetCategoryFilter = 'all' | AssetCategory;

export type AssetSortKey = 'highestNBV' | 'lowestNBV' | 'highestCost' | 'nameAsc' | 'codeAsc';

export const DEFAULT_ASSET_SORT: AssetSortKey = 'highestNBV';

export const ASSET_SORT_KEYS: AssetSortKey[] = [
  'highestNBV',
  'lowestNBV',
  'highestCost',
  'nameAsc',
  'codeAsc',
];

export type AssetCategoryCounts = Record<
  'all' | 'vehicle' | 'building' | 'machinery' | 'electronic' | 'land',
  number
>;

export const countAssetsByCategory = (assets: AssetItem[]): AssetCategoryCounts => {
  const count = (category: AssetCategory) =>
    assets.filter((asset) => asset.category === category).length;
  return {
    all: assets.length,
    vehicle: count('vehicle'),
    building: count('building'),
    machinery: count('machinery'),
    electronic: count('electronic'),
    land: count('land'),
  };
};

/** Filters by category tab and by a free-text query over name, code and notes. */
export const filterAssets = (
  assets: AssetItem[],
  category: string,
  searchQuery: string
): AssetItem[] => {
  let result = [...assets];

  if (category !== 'all') {
    result = result.filter((asset) => asset.category === category);
  }

  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    result = result.filter((asset) => {
      const name = (asset.name || '').toLowerCase();
      const code = (asset.code || '').toLowerCase();
      const notes = (asset.notes || '').toLowerCase();
      return name.includes(query) || code.includes(query) || notes.includes(query);
    });
  }

  return result;
};

/** Sorts in place and returns the same array, as the table always did. */
export const sortAssets = (assets: AssetItem[], sortBy: string): AssetItem[] =>
  assets.sort((a, b) => {
    const nbvA = toSafeNumber(a.netBookValue);
    const nbvB = toSafeNumber(b.netBookValue);
    const costA = toSafeNumber(a.acquisitionCost);
    const costB = toSafeNumber(b.acquisitionCost);
    const nameA = a.name || '';
    const nameB = b.name || '';
    const codeA = a.code || '';
    const codeB = b.code || '';

    if (sortBy === 'highestNBV') return nbvB - nbvA;
    if (sortBy === 'lowestNBV') return nbvA - nbvB;
    if (sortBy === 'highestCost') return costB - costA;
    if (sortBy === 'nameAsc') return nameA.localeCompare(nameB);
    if (sortBy === 'codeAsc') return codeA.localeCompare(codeB, undefined, { numeric: true });
    return 0;
  });
