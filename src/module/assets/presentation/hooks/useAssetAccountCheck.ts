import { invalidAccountFields, type AssetAccountField } from '@/module/assets/domain/assetRules';
import type { AssetItem } from '@/module/assets/domain/asset';
import { useAssetAccountsOfKind } from '@/module/assets/presentation/hooks/useAssetQueries';

/**
 * Tells which saved accounts of an asset are not of the kind they stand for. Nothing is flagged
 * until the three account groups have loaded, so a slow load never raises a false alarm.
 */
export const useAssetAccountCheck = (enabled = true) => {
  const fixed = useAssetAccountsOfKind('fixed_asset', enabled);
  const accumulated = useAssetAccountsOfKind('accumulated_depreciation', enabled);
  const expense = useAssetAccountsOfKind('depreciation_expense', enabled);
  const ready = Boolean(fixed.data && accumulated.data && expense.data);

  const invalidFor = (asset: AssetItem): AssetAccountField[] =>
    ready && asset.status === 'active'
      ? invalidAccountFields(asset, {
          fixed_asset: fixed.data ?? [],
          accumulated_depreciation: accumulated.data ?? [],
          depreciation_expense: expense.data ?? [],
        })
      : [];

  return { ready, invalidFor };
};
