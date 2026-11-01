import { AssetItem } from '@/module/assets/domain/asset';
import { AssetRepository } from '@/module/assets/domain/assetRepository';
import {
  calculateAssetDepreciation,
  resolveAssetStatus,
} from '@/module/assets/domain/depreciation';
import { INITIAL_SEED_ASSETS } from '@/module/assets/infrastructure/assetSeed';

/** Storage key and stored shape are unchanged: an array of `AssetItem`. */
export const ASSET_STORAGE_KEY = 'jurnal_fixed_assets_data';

const recalculate = (asset: AssetItem): AssetItem => {
  if (asset.status === 'disposed') return asset;
  const { accumulatedDepreciation, netBookValue } = calculateAssetDepreciation(
    asset.acquisitionCost,
    asset.residualValue,
    asset.usefulLifeYears,
    asset.depreciationMethod,
    asset.acquisitionDate
  );
  const fullyDepreciated = resolveAssetStatus(
    undefined,
    asset.depreciationMethod,
    netBookValue,
    asset.residualValue
  );
  return { ...asset, accumulatedDepreciation, netBookValue, status: fullyDepreciated };
};

const load = (): AssetItem[] => {
  if (typeof window === 'undefined') return INITIAL_SEED_ASSETS;
  try {
    const data = localStorage.getItem(ASSET_STORAGE_KEY);
    if (!data) {
      localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(INITIAL_SEED_ASSETS));
      return INITIAL_SEED_ASSETS;
    }
    const parsed: unknown = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return (parsed as AssetItem[]).map(recalculate);
    }
    return INITIAL_SEED_ASSETS;
  } catch {
    // Corrupt or unreadable storage falls back to the seed register.
    return INITIAL_SEED_ASSETS;
  }
};

const save = (assets: AssetItem[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ASSET_STORAGE_KEY, JSON.stringify(assets));
  } catch {
    // Quota or private-mode failures keep the in-memory register; nothing to persist.
  }
};

export const localStorageAssetRepository: AssetRepository = { load, save };
