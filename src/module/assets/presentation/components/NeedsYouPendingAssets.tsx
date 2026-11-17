import { Button, Text } from '@mantine/core';
import { IconPackageImport } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/WorkList.module.css';
import { WorkRow } from '@/module/assets/presentation/components/WorkRow';
import { useDecimalPrecision } from '@/module/settings';

/** Assets not in the books yet; activating one opens the same dialog as on the asset page. */
export function NeedsYouPendingAssets({
  assets,
  onActivate,
}: Readonly<{ assets: AssetItem[]; onActivate: (asset: AssetItem) => void }>) {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  return (
    <div className={classes.list}>
      {assets.map((asset) => (
        <WorkRow
          key={asset.id}
          icon={IconPackageImport}
          title={asset.code}
          titleSuffix={asset.name}
          subtitle={`${formatAssetDate(asset.acquisitionDate)}${
            asset.source === 'proapps' ? ' · ProApps' : ''
          }`}
          side={
            <>
              <Text size="sm" fw={500} className={classes.amount}>
                {formatAssetMoney(asset.acquisitionCost, precision)}
              </Text>
              <Button variant="default" size="xs" radius="md" onClick={() => onActivate(asset)}>
                {t('activate')}
              </Button>
            </>
          }
        />
      ))}
    </div>
  );
}

export default NeedsYouPendingAssets;
