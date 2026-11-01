import { AssetFormValues, AssetItem } from '@/module/assets/domain/asset';
import {
  calculateAssetDepreciation,
  calculateDisposalGainLoss,
  resolveAssetStatus,
} from '@/module/assets/domain/depreciation';

/** Form values with the numeric inputs coerced, which Mantine may hand over as strings. */
const normalize = (values: AssetFormValues) => ({
  code: values.code,
  name: values.name,
  category: values.category,
  acquisitionDate: values.acquisitionDate,
  acquisitionCost: Number(values.acquisitionCost),
  residualValue: Number(values.residualValue),
  usefulLifeYears: Number(values.usefulLifeYears),
  depreciationMethod: values.depreciationMethod,
  notes: values.notes,
});

const depreciate = (values: ReturnType<typeof normalize>) =>
  calculateAssetDepreciation(
    values.acquisitionCost,
    values.residualValue,
    values.usefulLifeYears,
    values.depreciationMethod,
    values.acquisitionDate
  );

export const createAsset = (values: AssetFormValues, id: string): AssetItem => {
  const fields = normalize(values);
  const { accumulatedDepreciation, netBookValue } = depreciate(fields);
  return {
    id,
    ...fields,
    accumulatedDepreciation,
    netBookValue,
    status: resolveAssetStatus(
      undefined,
      fields.depreciationMethod,
      netBookValue,
      fields.residualValue
    ),
  };
};

export const updateAsset = (item: AssetItem, values: AssetFormValues): AssetItem => {
  const fields = normalize(values);
  const { accumulatedDepreciation, netBookValue } = depreciate(fields);
  return {
    ...item,
    ...fields,
    accumulatedDepreciation,
    netBookValue,
    status: resolveAssetStatus(
      item.status,
      fields.depreciationMethod,
      netBookValue,
      fields.residualValue
    ),
  };
};

export const disposeAssetItem = (
  item: AssetItem,
  disposalDate: string,
  disposalPrice: number
): AssetItem => ({
  ...item,
  status: 'disposed',
  disposalDate,
  disposalPrice: Number(disposalPrice),
  disposalGainLoss: calculateDisposalGainLoss(Number(disposalPrice), item.netBookValue),
});
