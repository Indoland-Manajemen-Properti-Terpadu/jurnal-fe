import { Box, Grid, Group, Paper, Progress, SimpleGrid, Text } from '@mantine/core';
import dayjs from 'dayjs';
import { useTranslation } from '@/i18n';
import type { AssetItem } from '@/module/assets/domain/asset';
import {
  depreciationEndMonth,
  isNonDepreciable,
  percentOf,
  remainingLifeMonths,
} from '@/module/assets/domain/depreciation';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { formatAssetMoney } from '@/module/assets/presentation/components/formatAssetMoney';
import classes from '@/module/assets/presentation/components/AssetDetail.module.css';
import { useDecimalPrecision } from '@/module/settings';

const monthYear = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(new Date(iso));

function Figure({ label, value, tone }: Readonly<{ label: string; value: string; tone?: string }>) {
  return (
    <Box>
      <Text size="xs" c="dimmed" fw={500}>
        {label}
      </Text>
      <Text fz="lg" fw={700} c={tone ?? 'dark.9'} mt={2} className={classes.figure}>
        {value}
      </Text>
    </Box>
  );
}

/**
 * The asset's value as one equation: book value is the cost less the depreciation so far. The
 * bar shows how far the asset is through its depreciable amount.
 */
export function AssetValueSummary({ asset }: Readonly<{ asset: AssetItem }>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');
  const pending = asset.status === 'pending';
  const disposed = asset.status === 'disposed';
  const depreciating = !pending && !disposed && !isNonDepreciable(asset);

  const depreciable = Math.max(asset.acquisitionCost - asset.residualValue, 0);
  const progress = percentOf(asset.accumulatedDepreciation, depreciable);
  const end = depreciationEndMonth(asset);
  const left = remainingLifeMonths(asset, dayjs().format('YYYY-MM-DD'));
  const years = Math.floor(left / 12);
  const months = left % 12;
  const remaining =
    years && months
      ? t('lifeYearsMonths', { years, months })
      : years
        ? t('lifeYears', { years })
        : t('lifeMonths', { months });

  const gainLoss = asset.disposalGainLoss ?? 0;

  const caption = pending
    ? t('summaryPendingCaption')
    : disposed
      ? t('summaryDisposedCaption', { date: formatAssetDate(asset.disposalDate) })
      : isNonDepreciable(asset)
        ? t('landNoDepreciation')
        : null;

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Grid gutter="xl" align="center">
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Text size="xs" c="dimmed" fw={500}>
            {t('netBookValue')}
          </Text>
          <Text fz={32} fw={700} c="dark.9" lh={1.15} mt={4} className={classes.figure}>
            {formatAssetMoney(asset.netBookValue, precision)}
          </Text>

          {depreciating ? (
            <Box mt="md">
              <Progress
                value={progress}
                size="md"
                radius="xl"
                color="primary.6"
                aria-label={t('depreciatedPercentLabel', { percent: progress })}
              />
              <Group justify="space-between" mt={8} gap="xs">
                <Text size="xs" c="dimmed">
                  {t('depreciatedPercentLabel', { percent: progress })}
                </Text>
                {end && (
                  <Text size="xs" c="dimmed">
                    {t('lifeEndsOn', { date: monthYear(end) })}
                  </Text>
                )}
              </Group>
            </Box>
          ) : (
            caption && (
              <Text size="sm" c="dimmed" mt="sm">
                {caption}
              </Text>
            )
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <SimpleGrid cols={2} spacing="lg" verticalSpacing="lg" className={classes.figures}>
            <Figure
              label={t('acquisitionCost')}
              value={formatAssetMoney(asset.acquisitionCost, precision)}
            />
            <Figure
              label={t('accumulatedDepreciationFull')}
              value={pending ? '—' : formatAssetMoney(asset.accumulatedDepreciation, precision)}
            />
            {disposed ? (
              <>
                <Figure
                  label={t('disposalPriceLabel')}
                  value={formatAssetMoney(asset.disposalPrice ?? 0, precision)}
                />
                <Figure
                  label={gainLoss >= 0 ? t('disposalGain') : t('disposalLoss')}
                  value={formatAssetMoney(Math.abs(gainLoss), precision)}
                  tone={gainLoss >= 0 ? 'teal.8' : 'orange.8'}
                />
              </>
            ) : (
              <>
                <Figure
                  label={t('monthlyEstimateLabel')}
                  value={depreciating ? formatAssetMoney(asset.monthlyEstimate, precision) : '—'}
                />
                <Figure label={t('remainingLifeLabel')} value={depreciating ? remaining : '—'} />
              </>
            )}
          </SimpleGrid>
        </Grid.Col>
      </Grid>
    </Paper>
  );
}

export default AssetValueSummary;
