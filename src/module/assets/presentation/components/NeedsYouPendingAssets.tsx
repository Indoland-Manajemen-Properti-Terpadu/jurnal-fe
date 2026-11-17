import { Box, Button, Group, Stack, Text } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/NeedsYou.module.css';
import { routes } from '@/router/routes';
import { useDecimalPrecision } from '@/module/settings';

/** Assets not in the books yet; activating one opens the same dialog as on the asset page. */
export function NeedsYouPendingAssets({
  assets,
  onActivate,
}: Readonly<{ assets: AssetItem[]; onActivate: (asset: AssetItem) => void }>) {
  const { t } = useTranslation('assetWriteOffs');
  const precision = useDecimalPrecision();
  return (
    <Stack gap="xs">
      {assets.map((asset) => (
        <Box key={asset.id} className={classes.row}>
          <Box className={classes.rowMain}>
            <Text
              component={Link}
              to={routes.assets.detail.replace(':id', asset.id)}
              fw={700}
              size="sm"
              c="primary.8"
            >
              {asset.name}
            </Text>
            <Text size="xs" c="dimmed">
              {asset.code} · {formatAssetDate(asset.acquisitionDate)}
              {asset.source === 'proapps' ? ' · ProApps' : ''}
            </Text>
          </Box>
          <Group gap="md" wrap="nowrap">
            <Text size="sm" fw={600} className={classes.num}>
              {formatAssetMoney(asset.acquisitionCost, precision)}
            </Text>
            <Button
              size="xs"
              radius="md"
              variant="light"
              leftSection={<IconCircleCheck size={14} />}
              onClick={() => onActivate(asset)}
            >
              {t('activate')}
            </Button>
          </Group>
        </Box>
      ))}
    </Stack>
  );
}

export default NeedsYouPendingAssets;
