import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { ActivationValues, AssetItem } from '@/module/assets/domain/asset';
import { validateActivation } from '@/module/assets/domain/assetRules';

/** Starting values: the asset's own terms when it already has them, otherwise empty. */
export const initialActivationValues = (asset?: AssetItem | null): ActivationValues => ({
  assetAccount: asset?.assetAccount?.id ?? '',
  creditAccount: asset?.creditAccount?.id ?? '',
  accumDeprAccount: asset?.accumDeprAccount?.id ?? '',
  deprExpenseAccount: asset?.deprExpenseAccount?.id ?? '',
  depreciationMethod:
    asset && asset.status !== 'pending' ? asset.depreciationMethod : 'straight_line',
  usefulLifeYears: asset?.usefulLifeYears ?? 0,
  residualValue: asset?.residualValue ?? 0,
  accumulatedDepreciation: asset?.openingAccumulatedDepreciation ?? 0,
  depreciationStartDate: asset?.status === 'pending' ? '' : (asset?.depreciationStartDate ?? ''),
});

/**
 * Form state of the accounts and depreciation terms. `getCost` reads the acquisition cost at
 * validation time because the add form owns it.
 */
export function useActivationForm(asset: AssetItem | null | undefined, getCost: () => number) {
  const { t } = useTranslation('assets');

  return useForm<ActivationValues>({
    initialValues: initialActivationValues(asset),
    validate: (values) =>
      Object.fromEntries(
        Object.entries(validateActivation(values, getCost())).map(([field, key]) => [field, t(key)])
      ),
  });
}
