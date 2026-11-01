import { ReactElement } from 'react';
import {
  IconBuilding,
  IconCar,
  IconCoins,
  IconDeviceLaptop,
  IconMapPin,
  IconTool,
  type Icon,
} from '@tabler/icons-react';
import { AssetCategory } from '@/module/assets/domain/asset';

export interface AssetCategoryMeta {
  icon: Icon;
  /** Color on the list screen. */
  listColor: string;
  /** Color on the detail screen, which has always differed from the list. */
  detailColor: string;
  /** i18n key (namespace `assets`) of the label used on the list and in forms. */
  labelKey: string;
  /** i18n key of the label used on the detail screen. */
  detailLabelKey: string;
}

export const ASSET_CATEGORY_META: Record<AssetCategory, AssetCategoryMeta> = {
  vehicle: {
    icon: IconCar,
    listColor: 'blue',
    detailColor: 'blue',
    labelKey: 'categoryVehicle',
    detailLabelKey: 'categoryVehicle',
  },
  building: {
    icon: IconBuilding,
    listColor: 'indigo',
    detailColor: 'indigo',
    labelKey: 'categoryBuilding',
    detailLabelKey: 'detailCategoryBuilding',
  },
  machinery: {
    icon: IconTool,
    listColor: 'orange',
    detailColor: 'cyan',
    labelKey: 'categoryMachinery',
    detailLabelKey: 'categoryMachinery',
  },
  electronic: {
    icon: IconDeviceLaptop,
    listColor: 'cyan',
    detailColor: 'violet',
    labelKey: 'categoryElectronic',
    detailLabelKey: 'detailCategoryElectronic',
  },
  land: {
    icon: IconMapPin,
    listColor: 'green',
    detailColor: 'teal',
    labelKey: 'categoryLand',
    detailLabelKey: 'categoryLand',
  },
  other: {
    icon: IconCoins,
    listColor: 'gray',
    detailColor: 'gray',
    labelKey: 'categoryOther',
    detailLabelKey: 'categoryOther',
  },
};

/** Unknown stored categories fall back to `other`, as the screens always did. */
export const getCategoryMeta = (category: AssetCategory): AssetCategoryMeta =>
  ASSET_CATEGORY_META[category] ?? ASSET_CATEGORY_META.other;

export const renderCategoryIcon = (category: AssetCategory, size = 18): ReactElement => {
  const CategoryIcon = getCategoryMeta(category).icon;
  return <CategoryIcon size={size} stroke={1.8} />;
};
