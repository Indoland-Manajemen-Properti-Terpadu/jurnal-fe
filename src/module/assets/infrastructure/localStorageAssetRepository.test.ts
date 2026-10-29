import { beforeEach, describe, expect, it } from 'vitest';
import { INITIAL_SEED_ASSETS } from '@/module/assets/infrastructure/assetSeed';
import {
  ASSET_STORAGE_KEY,
  localStorageAssetRepository,
} from '@/module/assets/infrastructure/localStorageAssetRepository';

describe('localStorageAssetRepository', () => {
  beforeEach(() => localStorage.clear());

  it('keeps the legacy storage key', () => {
    expect(ASSET_STORAGE_KEY).toBe('jurnal_fixed_assets_data');
  });

  it('seeds the register on first load and stores the seed under the key', () => {
    const loaded = localStorageAssetRepository.load();
    expect(loaded).toHaveLength(INITIAL_SEED_ASSETS.length);
    expect(JSON.parse(localStorage.getItem(ASSET_STORAGE_KEY) ?? '[]')).toHaveLength(
      INITIAL_SEED_ASSETS.length
    );
  });

  it('falls back to the seed when the stored value is corrupt or empty', () => {
    localStorage.setItem(ASSET_STORAGE_KEY, '{not json');
    expect(localStorageAssetRepository.load()).toHaveLength(INITIAL_SEED_ASSETS.length);
    localStorage.setItem(ASSET_STORAGE_KEY, '[]');
    expect(localStorageAssetRepository.load()).toHaveLength(INITIAL_SEED_ASSETS.length);
  });

  it('saves the array of assets as plain JSON', () => {
    const [first] = INITIAL_SEED_ASSETS;
    localStorageAssetRepository.save([first]);
    expect(JSON.parse(localStorage.getItem(ASSET_STORAGE_KEY) ?? '[]')).toEqual([first]);
  });
});
