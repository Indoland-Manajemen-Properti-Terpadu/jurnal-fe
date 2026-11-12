import { Progress, RingProgress, Skeleton, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { AssetSummary } from '@/module/assets/domain/asset';
import { percentOf } from '@/module/assets/domain/depreciation';
import {
  AssetStatCard,
  statCardClasses,
  statCardGridClass,
} from '@/module/assets/presentation/components/AssetStatCard';
import { ASSET_STATUS_ORDER } from '@/module/assets/presentation/components/assetStatusMeta';
import {
  formatAssetMoney,
  formatAssetMoneyShort,
} from '@/module/assets/presentation/components/formatAssetMoney';
import { useDecimalPrecision } from '@/module/settings';

export type AssetStatsGridProps = {
  summary?: AssetSummary;
  loading?: boolean;
};

export function AssetStatsGrid({ summary, loading }: Readonly<AssetStatsGridProps>) {
  const precision = useDecimalPrecision();
  const { t } = useTranslation('assets');

  if (loading || !summary) {
    return (
      <div className={statCardGridClass}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} height={104} radius="md" />
        ))}
      </div>
    );
  }

  const { counts } = summary;
  const total = ASSET_STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);
  const peak = Math.max(...ASSET_STATUS_ORDER.map((status) => counts[status]), 0);
  const depreciatedPercent = percentOf(
    summary.totalAccumulatedDepreciation,
    summary.totalAcquisitionCost
  );
  const bookPercent = percentOf(summary.totalNetBookValue, summary.totalAcquisitionCost);
  const activePercent = percentOf(counts.active, total);
  const statusCounts = ASSET_STATUS_ORDER.map((status) => counts[status]);

  return (
    <div className={statCardGridClass}>
      <AssetStatCard
        label={t('totalAcquisitionCost')}
        value={formatAssetMoneyShort(summary.totalAcquisitionCost, precision)}
        valueTitle={formatAssetMoney(summary.totalAcquisitionCost, precision)}
        hint={t('statsTotalHint', { count: total })}
        visual={
          <div
            className={statCardClasses.bars}
            role="img"
            aria-label={t('statsStatusChart', { counts: statusCounts.join(', ') })}
          >
            {statusCounts.map((count, index) => (
              <span
                key={ASSET_STATUS_ORDER[index]}
                className={statCardClasses.bar}
                data-peak={peak > 0 && count === peak}
                style={{ height: `${peak > 0 ? Math.max((count / peak) * 100, 7) : 7}%` }}
              />
            ))}
          </div>
        }
      />

      <AssetStatCard
        label={t('totalDepreciation')}
        value={formatAssetMoneyShort(summary.totalAccumulatedDepreciation, precision)}
        valueTitle={formatAssetMoney(summary.totalAccumulatedDepreciation, precision)}
        hint={t('totalDepreciationSub')}
        visual={
          <RingProgress
            size={56}
            thickness={6}
            roundCaps
            sections={[{ value: depreciatedPercent, color: 'primary.6' }]}
            rootColor="var(--mantine-color-primary-1)"
            label={
              <Text ta="center" className={statCardClasses.percent}>
                {depreciatedPercent}%
              </Text>
            }
            aria-label={`${t('totalDepreciation')} ${depreciatedPercent}%`}
          />
        }
      />

      <AssetStatCard
        label={t('netBookValue')}
        value={formatAssetMoneyShort(summary.totalNetBookValue, precision)}
        valueTitle={formatAssetMoney(summary.totalNetBookValue, precision)}
        hint={t('netBookValueSub')}
        visual={
          <>
            <Text className={statCardClasses.percent}>{bookPercent}%</Text>
            <Progress
              value={bookPercent}
              size="sm"
              radius="xl"
              color="primary.6"
              w="100%"
              aria-label={`${t('netBookValue')} ${bookPercent}%`}
            />
          </>
        }
      />

      <AssetStatCard
        label={t('activeAssetsCount')}
        value={t('activeUnits', { count: counts.active })}
        hint={t('pendingAssetsSub', { count: counts.pending })}
        visual={
          <>
            <Text className={statCardClasses.percent}>{activePercent}%</Text>
            <Progress
              value={activePercent}
              size="sm"
              radius="xl"
              color="primary.6"
              w="100%"
              aria-label={`${t('activeAssetsCount')} ${activePercent}%`}
            />
          </>
        }
      />
    </div>
  );
}

export default AssetStatsGrid;
