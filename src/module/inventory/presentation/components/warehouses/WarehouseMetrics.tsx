import {
  IconAlertTriangle,
  IconBuildingWarehouse,
  IconCoin,
  IconPackage,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type {
  Warehouse,
  WarehouseStockItem,
  WarehouseSummary,
} from '@/module/inventory/domain/warehouse';
import { shareOfTotal, topShares, type ShareInput } from '@/module/inventory/domain/metricShares';
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

/** Ranked slices of a total in brand blues, and the largest one for the caption. */
const useShares = () => {
  const { t } = useTranslation('warehouses');
  return (items: ShareInput[]) => {
    const shares = topShares(items, MAX_SLICES, t('summary.others'));
    const segments: BarSegment[] = shares.map((share, index) => ({
      key: share.key,
      label: share.label,
      value: share.value,
      color: RANK_COLORS[Math.min(index, RANK_COLORS.length - 1)],
      display: `${share.percent}%`,
    }));
    return { segments, largest: shares[0] };
  };
};

type ListProps = {
  summary: WarehouseSummary;
  /** Every active warehouse, so the pictures cover the whole site and not one page of the list. */
  warehouses: Warehouse[];
};

/** The three figures above the warehouse list; each card has one bar and one line that reads it. */
export function WarehouseListMetrics({ summary, warehouses }: Readonly<ListProps>) {
  const { t } = useTranslation('warehouses');
  const sharesOf = useShares();
  const activePercent = shareOfTotal(summary.activeCount, summary.totalCount);
  const byItems = sharesOf(
    warehouses.map((item) => ({ key: item.id, label: item.name, value: item.itemCount }))
  );
  const byValue = sharesOf(
    warehouses.map((item) => ({ key: item.id, label: item.name, value: item.inventoryValue ?? 0 }))
  );

  return (
    <MetricGrid>
      <MetricCard
        icon={IconBuildingWarehouse}
        label={t('summary.active')}
        value={t('summary.activeOf', { active: summary.activeCount, total: summary.totalCount })}
        visual={
          <PercentBar
            percent={activePercent}
            caption={t('summary.activeShare', { percent: activePercent })}
          />
        }
      />
      <MetricCard
        icon={IconPackage}
        label={t('summary.items')}
        value={t('summary.itemsCount', { count: numberFormat(summary.itemCount) })}
        visual={
          byItems.largest ? (
            <ShareBar
              segments={byItems.segments}
              caption={t('summary.mostItems', {
                name: byItems.largest.label,
                percent: byItems.largest.percent,
              })}
              aria-label={t('summary.itemsByWarehouse')}
            />
          ) : undefined
        }
      />
      {summary.inventoryValue !== null && (
        <MetricCard
          icon={IconCoin}
          label={t('summary.value')}
          value={formatCurrency(summary.inventoryValue)}
          visual={
            byValue.largest ? (
              <ShareBar
                segments={byValue.segments}
                caption={t('summary.largest', {
                  name: byValue.largest.label,
                  percent: byValue.largest.percent,
                })}
                aria-label={t('summary.valueByWarehouse')}
              />
            ) : undefined
          }
        />
      )}
    </MetricGrid>
  );
}

type DetailProps = {
  warehouse: Warehouse;
  stock: WarehouseStockItem[];
  /** False until the stock has loaded, so no picture is drawn from half the data. */
  stockReady: boolean;
};

const STATUS_COLOR = {
  safe: 'var(--mantine-color-primary-6)',
  belowMin: 'var(--mantine-color-orange-5)',
  empty: 'var(--mantine-color-red-6)',
} as const;

/** The three figures on a warehouse's own page. */
export function WarehouseDetailMetrics({ warehouse, stock, stockReady }: Readonly<DetailProps>) {
  const { t } = useTranslation('warehouses');
  const sharesOf = useShares();
  const inStock = stock.filter((item) => item.quantity > 0).length;
  const stockedPercent = shareOfTotal(inStock, stock.length);
  const byProduct = sharesOf(
    stock.map((item) => ({ key: item.productId, label: item.name, value: item.value ?? 0 }))
  );
  const countOf = (status: WarehouseStockItem['status']) =>
    stock.filter((item) => item.status === status).length;
  const statusSegments: BarSegment[] = (['safe', 'belowMin', 'empty'] as const).map((status) => ({
    key: status,
    label: t(`detail.stockStatus.${status}`),
    value: countOf(status),
    color: STATUS_COLOR[status],
  }));
  const short = warehouse.belowMinCount > 0;
  const ready = stockReady && stock.length > 0;
  const emptyCount = countOf('empty');
  let shortHint: string | undefined;
  if (emptyCount > 0) shortHint = t('detail.stats.emptyCount', { count: emptyCount });
  else if (short) shortHint = t('detail.stats.restock');
  else if (ready) shortHint = t('detail.stats.allSafe');

  return (
    <MetricGrid>
      <MetricCard
        icon={IconPackage}
        label={t('detail.stats.items')}
        value={t('summary.itemsCount', { count: numberFormat(warehouse.itemCount) })}
        hint={stockReady && stock.length === 0 ? t('detail.stats.noProducts') : undefined}
        visual={
          ready ? (
            <PercentBar
              percent={stockedPercent}
              caption={t('detail.stats.inStock', { count: inStock, total: stock.length })}
            />
          ) : undefined
        }
      />
      {warehouse.inventoryValue !== null && (
        <MetricCard
          icon={IconCoin}
          label={t('detail.stats.value')}
          value={formatCurrency(warehouse.inventoryValue)}
          visual={
            ready && byProduct.largest ? (
              <ShareBar
                segments={byProduct.segments}
                caption={t('detail.stats.largest', {
                  name: byProduct.largest.label,
                  percent: byProduct.largest.percent,
                })}
                aria-label={t('detail.stats.valueByProduct')}
              />
            ) : undefined
          }
        />
      )}
      <MetricCard
        icon={IconAlertTriangle}
        label={t('detail.stats.belowMin')}
        value={t('summary.itemsCount', { count: numberFormat(warehouse.belowMinCount) })}
        hint={shortHint}
        tone={short ? 'warning' : 'default'}
        visual={
          ready ? (
            <ShareBar
              segments={statusSegments}
              caption={t('detail.stats.statusCaption', {
                safe: countOf('safe'),
                below: countOf('belowMin'),
                empty: emptyCount,
              })}
              aria-label={t('detail.stats.statusSplit')}
            />
          ) : undefined
        }
      />
    </MetricGrid>
  );
}
