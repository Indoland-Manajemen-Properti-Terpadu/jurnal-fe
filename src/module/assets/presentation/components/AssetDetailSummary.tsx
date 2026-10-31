import { Box, Group, Paper, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { AssetItem } from '@/module/assets/domain/asset';
import { isNonDepreciable, toSafeNumber } from '@/module/assets/domain/depreciation';

export type AssetDetailSummaryProps = {
  asset: AssetItem;
};

type SummaryRowProps = {
  label: string;
  value: string;
  valueProps: { fw: number; c: string };
  divider?: boolean;
};

function SummaryRow({ label, value, valueProps, divider = true }: Readonly<SummaryRowProps>) {
  return (
    <Group
      justify="space-between"
      py={4}
      style={divider ? { borderBottom: '1px solid var(--mantine-color-slate-1)' } : undefined}
    >
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="xs" {...valueProps}>
        {value}
      </Text>
    </Group>
  );
}

export function AssetDetailSummary({ asset }: Readonly<AssetDetailSummaryProps>) {
  const { t } = useTranslation('assets');
  const nonDepreciable = isNonDepreciable(asset);

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" p="md" bg="white">
        <Text fw={700} size="sm" c="dark.9" mb="sm">
          {t('financialSummary')}
        </Text>
        <Stack gap="xs">
          <SummaryRow
            label={t('acquisitionCost')}
            value={formatCurrency(toSafeNumber(asset.acquisitionCost))}
            valueProps={{ fw: 700, c: 'dark.9' }}
          />
          <SummaryRow
            label={t('accumulatedDepreciationFull')}
            value={`-${formatCurrency(toSafeNumber(asset.accumulatedDepreciation))}`}
            valueProps={{ fw: 700, c: 'red.7' }}
          />
          <SummaryRow
            label={t('netBookValue')}
            value={formatCurrency(toSafeNumber(asset.netBookValue))}
            valueProps={{ fw: 800, c: 'teal.8' }}
          />
          <SummaryRow
            label={t('residualPlain')}
            value={formatCurrency(toSafeNumber(asset.residualValue))}
            valueProps={{ fw: 600, c: 'dark.8' }}
          />
          <SummaryRow
            label={t('usefulLife')}
            value={
              nonDepreciable
                ? t('noDepreciation')
                : t('yearsValue', { years: asset.usefulLifeYears })
            }
            valueProps={{ fw: 600, c: 'dark.8' }}
            divider={false}
          />
        </Stack>
      </Paper>

      <Paper withBorder radius="lg" p="md" bg="white">
        <Text fw={700} size="sm" c="dark.9" mb="sm">
          {t('assetNotes')}
        </Text>
        <Box
          p="sm"
          style={{
            backgroundColor: 'var(--mantine-color-slate-0)',
            borderRadius: 8,
            border: '1px solid var(--mantine-color-slate-1)',
          }}
        >
          <Text size="xs" c="dark.7" lh={1.6}>
            {asset.notes || t('noNotes')}
          </Text>
        </Box>
      </Paper>
    </Stack>
  );
}

export default AssetDetailSummary;
