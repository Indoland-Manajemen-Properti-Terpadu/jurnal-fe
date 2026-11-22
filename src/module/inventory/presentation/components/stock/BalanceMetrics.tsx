import { IconAlertTriangle, IconCoin, IconPackage, IconPackageOff } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { BalanceReport } from '@/module/inventory/domain/stockBalance';
import { shareOfTotal, topShares } from '@/module/inventory/domain/metricShares';
import {
  MetricCard,
  MetricGrid,
} from '@/module/inventory/presentation/components/metrics/MetricCard';
import {
  PercentBar,
  RANK_COLORS,
  ShareBar,
  type BarSegment,
} from '@/module/inventory/presentation/components/metrics/visuals';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

const MAX_SLICES = 3;
const WARNING = 'var(--mantine-color-orange-5)';

/**
 * The four figures above the balances. Every card has the same parts: the figure, what it means,
 * and one bar with one line that reads it, so the cards line up.
 */
export function BalanceMetrics({ report }: Readonly<{ report: BalanceReport }>) {
  const { t } = useTranslation('stockMovements');
  const { summary, rows, warehouses } = report;
  const tracked = summary.trackedProducts;
  const holdingStock = warehouses.filter((warehouse) =>
    rows.some((row) => (row.quantities[warehouse.id] ?? 0) > 0)
  ).length;
  const shares = topShares(
    rows.map((row) => ({ key: row.productId, label: row.name, value: row.value ?? 0 })),
    MAX_SLICES,
    t('metrics.others')
  );
  const byProduct: BarSegment[] = shares.map((share, index) => ({
    key: share.key,
    label: share.label,
    value: share.value,
    color: RANK_COLORS[Math.min(index, RANK_COLORS.length - 1)],
    display: `${share.percent}%`,
  }));
  const [largest] = shares;
  const ofTracked = (count: number) => t('metrics.ofTracked', { count, total: tracked });

  return (
    <MetricGrid columns={summary.inventoryValue === null ? 3 : 4}>
      {summary.inventoryValue !== null && (
        <MetricCard
          icon={IconCoin}
          label={t('metrics.value')}
          value={formatCurrency(summary.inventoryValue)}
          hint={t('metrics.valueHint', { count: holdingStock })}
          visual={
            largest ? (
              <ShareBar
                segments={byProduct}
                caption={t('metrics.largest', { name: largest.label, percent: largest.percent })}
                aria-label={t('metrics.valueByProduct')}
              />
            ) : undefined
          }
        />
      )}
      <MetricCard
        icon={IconPackage}
        label={t('metrics.tracked')}
        value={t('metrics.productsCount', { count: numberFormat(tracked) })}
        hint={t('metrics.trackedHint', { count: rows.length })}
        visual={
          <PercentBar
            percent={shareOfTotal(rows.length, tracked)}
            caption={t('metrics.trackedShare', { percent: shareOfTotal(rows.length, tracked) })}
          />
        }
      />
      <MetricCard
        icon={IconAlertTriangle}
        label={t('metrics.belowMin')}
        value={t('metrics.productsCount', { count: numberFormat(summary.belowMinCount) })}
        hint={t(summary.belowMinCount > 0 ? 'metrics.belowMinHint' : 'metrics.belowMinNone')}
        tone={summary.belowMinCount > 0 ? 'warning' : 'default'}
        visual={
          <PercentBar
            percent={shareOfTotal(summary.belowMinCount, tracked)}
            caption={ofTracked(summary.belowMinCount)}
            color={WARNING}
          />
        }
      />
      <MetricCard
        icon={IconPackageOff}
        label={t('metrics.empty')}
        value={t('metrics.productsCount', { count: numberFormat(summary.emptyCount) })}
        hint={t(summary.emptyCount > 0 ? 'metrics.emptyHint' : 'metrics.emptyNone')}
        tone={summary.emptyCount > 0 ? 'warning' : 'default'}
        visual={
          <PercentBar
            percent={shareOfTotal(summary.emptyCount, tracked)}
            caption={ofTracked(summary.emptyCount)}
            color={WARNING}
          />
        }
      />
    </MetricGrid>
  );
}
