import { Box, Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { AssetItem } from '@/module/assets/domain/asset';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';

export type AssetDisposalNoticeProps = {
  asset: AssetItem;
};

/** Banner shown on the detail page once an asset has been disposed. */
export function AssetDisposalNotice({ asset }: Readonly<AssetDisposalNoticeProps>) {
  const { t } = useTranslation('assets');
  const gainLoss = asset.disposalGainLoss ?? 0;

  return (
    <Paper
      withBorder
      radius="lg"
      p="md"
      style={{
        backgroundColor: 'rgba(254, 243, 199, 0.4)',
        borderColor: 'var(--mantine-color-orange-3)',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm">
          <ThemeIcon size={32} radius="md" color="orange" variant="light">
            <IconScale size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              {t('disposedNoticeTitle')}
            </Text>
            <Text size="xs" c="dark.6">
              {t('disposedNoticeBody', {
                date: formatAssetDate(asset.disposalDate),
                price: formatCurrency(asset.disposalPrice ?? 0),
              })}
            </Text>
          </Box>
        </Group>
        <Group gap="xs">
          <Text size="xs" c="dimmed">
            {t('gainLossLabel')}:
          </Text>
          <Text size="sm" fw={700} c={gainLoss >= 0 ? 'teal.7' : 'red.7'}>
            {gainLoss >= 0 ? '+' : ''}
            {formatCurrency(gainLoss)}
          </Text>
        </Group>
      </Group>
    </Paper>
  );
}

export default AssetDisposalNotice;
