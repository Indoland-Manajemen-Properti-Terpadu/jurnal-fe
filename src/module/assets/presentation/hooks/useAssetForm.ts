import { useEffect } from 'react';
import { useForm } from '@mantine/form';
import { useTranslation } from '@/i18n';
import { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import {
  calculateAssetDepreciation,
  estimateDepreciation,
} from '@/module/assets/domain/depreciation';

const today = () => new Date().toISOString().split('T')[0];

const generateAssetCode = () => `AST-${Math.floor(100 + Math.random() * 900)}`;

/** Form state, validation and the live depreciation preview of the asset form. */
export function useAssetForm(opened: boolean, assetToEdit?: AssetItem | null) {
  const { t } = useTranslation('assets');

  const form = useForm<AssetFormValues>({
    initialValues: {
      id: undefined,
      code: '',
      name: '',
      category: 'vehicle',
      acquisitionDate: today(),
      acquisitionCost: 100000000,
      residualValue: 10000000,
      usefulLifeYears: 5,
      depreciationMethod: 'straight_line',
      notes: '',
    },
    validate: {
      code: (val) => (!val?.trim() ? t('errCodeRequired') : null),
      name: (val) => (!val?.trim() ? t('errNameRequired') : null),
      acquisitionCost: (val) => (val <= 0 ? t('errCostPositive') : null),
      residualValue: (val, values) =>
        val >= values.acquisitionCost ? t('errResidualTooHigh') : null,
      usefulLifeYears: (val, values) =>
        values.depreciationMethod !== 'none' && val <= 0 ? t('errUsefulLifeMin') : null,
    },
  });

  useEffect(() => {
    if (assetToEdit) {
      form.setValues({
        id: assetToEdit.id,
        code: assetToEdit.code,
        name: assetToEdit.name,
        category: assetToEdit.category,
        acquisitionDate: assetToEdit.acquisitionDate,
        acquisitionCost: assetToEdit.acquisitionCost,
        residualValue: assetToEdit.residualValue,
        usefulLifeYears: assetToEdit.usefulLifeYears,
        depreciationMethod: assetToEdit.depreciationMethod,
        notes: assetToEdit.notes || '',
      });
    } else {
      form.reset();
      form.setFieldValue('code', generateAssetCode());
    }
  }, [assetToEdit, opened]);

  const liveCost = Number(form.values.acquisitionCost) || 0;
  const liveResidual = Number(form.values.residualValue) || 0;
  const liveYears = Number(form.values.usefulLifeYears) || 0;
  const liveMethod = form.values.depreciationMethod;

  const estimate = estimateDepreciation(liveCost, liveResidual, liveYears, liveMethod);
  const preview = calculateAssetDepreciation(
    liveCost,
    liveResidual,
    liveYears,
    liveMethod,
    form.values.acquisitionDate
  );

  return { form, liveCost, liveMethod, estimate, preview };
}
