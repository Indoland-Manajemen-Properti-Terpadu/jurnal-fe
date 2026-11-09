import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';

const today = () => new Date().toISOString().split('T')[0];

const initialValues = (asset?: AssetItem | null): AssetFormValues => ({
  code: asset?.code ?? '',
  name: asset?.name ?? '',
  categoryName: asset?.categoryName ?? '',
  acquisitionDate: asset?.acquisitionDate ?? today(),
  acquisitionCost: asset?.acquisitionCost ?? 0,
  notes: asset?.notes ?? '',
  tagIds: asset?.tags.map((tag) => tag.id) ?? [],
});

/**
 * Form state and validation of the asset form. The values start from the asset being edited;
 * the dialog mounts a fresh form each time it opens, so it never holds a previous asset.
 */
export function useAssetForm(assetToEdit?: AssetItem | null) {
  const { t } = useTranslation('assets');

  return useForm<AssetFormValues>({
    initialValues: initialValues(assetToEdit),
    validate: {
      code: (val) => (!val?.trim() ? t('errCodeRequired') : null),
      name: (val) => (!val?.trim() ? t('errNameRequired') : null),
      acquisitionDate: (val) => (!val ? t('errDateRequired') : null),
      acquisitionCost: (val) => (Number(val) > 0 ? null : t('errCostPositive')),
    },
  });
}
