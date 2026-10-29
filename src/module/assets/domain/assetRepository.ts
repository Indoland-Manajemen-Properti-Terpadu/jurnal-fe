import { AssetItem } from '@/module/assets/domain/asset';

/** Port for loading and saving the fixed asset register. */
export interface AssetRepository {
  /** Returns the register with depreciation recalculated for today. */
  load(): AssetItem[];
  save(assets: AssetItem[]): void;
}
