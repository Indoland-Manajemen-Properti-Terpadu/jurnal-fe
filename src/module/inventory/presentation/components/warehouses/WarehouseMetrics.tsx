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
  Legend,
  RANK_COLORS,
  RingStat,
  SegmentBar,
  type BarSegment,
} from '@/module/inventory/presentation/components/metrics/visuals';
import { formatCurrency, numberFormat } from '@/utils/formatCurrency';

const MAX_SLICES = 3;

/** Ranked slices of a total in brand blues, each labelled with its percent. */
const useShareSegments = () => {
  const { t } = useTranslation('warehouses');
  return (items: ShareInput[]): BarSegment[] =>
    topShares(items, MAX_SLICES, t('summary.others')).map((share, index) => ({
      key: share.key,
      label: share.label,
      value: share.value,
      color: RANK_COLORS[Math.min(index, RANK_COLORS.length - 1)],
      display: `${share.percent}%`,
    }));
};

const ShareVisual = ({ segments, label }: Readonly<{ segments: BarSegment[]; label: string }>) => (
  <>
    <SegmentBar segments={segments} aria-label={label} />
    <Legend segments={segments} />
  </>
);

type ListProps = {
  summary: WarehouseSummary;
  /** Every active warehouse, so the pictures cover the whole site and not one page of the list. */
  warehouses: Warehouse[];
};

/** The three figures above the warehouse list, each with a picture of how it is spread. */
export function WarehouseListMetrics({ summary, warehouses }: Readonly<ListProps>) {
  const { t } = useTranslation('warehouses');
  const segmentsOf = useShareSegments();
  const activePercent = shareOfTotal(summary.activeCount, summary.totalCount);
  const byItems = segmentsOf(
    warehouses.map((item) => ({ key: item.id, label: item.name, value: item.itemCount }))
  );
  const byValue = segmentsOf(
    warehouses.map((item) => ({ key: item.id, label: item.name, value: item.inventoryValue ?? 0 }))
  );

  return (
    <MetricGrid>
      <MetricCard
        icon={IconBuildingWarehouse}
        label={t('summary.active')}
        value={numberFormat(summary.activeCount)}
        hint={t('summary.activeOf', { active: summary.activeCount, total: summary.totalCount })}
        visual={
          summary.totalCount > 0 ? (
            <RingStat
              percent={activePercent}
              aria-label={t('summary.activeShare', { percent: activePercent })}
            />
          ) : undefined
        }
      />
      <MetricCard
        icon={IconPackage}
        label={t('summary.items')}
        value={numberFormat(summary.itemCount)}
        hint={t('summary.itemsCount', { count: summary.itemCount })}
        wideVisual
        visual={
          byItems.length > 0 ? (
            <ShareVisual segments={byItems} label={t('summary.itemsByWarehouse')} />
          ) : undefined
        }
      />
      {summary.inventoryValue !== null && (
        <MetricCard
          icon={IconCoin}
          label={t('summary.value')}
          value={formatCurrency(summary.inventoryValue)}
          hint={t('summary.valueHint', {
            count: warehouses.filter((item) => item.itemCount > 0).length,
          })}
          wideVisual
          visual={
            byValue.length > 0 ? (
              <ShareVisual segments={byValue} label={t('summary.valueByWarehouse')} />
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
  const segmentsOf = useShareSegments();
  const inStock = stock.filter((item) => item.quantity > 0).length;
  const stockedPercent = shareOfTotal(inStock, stock.length);
  const byProduct = segmentsOf(
    stock.map((item) => ({ key: item.productId, label: item.name, value: item.value ?? 0 }))
  );
  const countOf = (status: WarehouseStockItem['status']) =>
    stock.filter((item) => item.status === status).length;
  const emptyCount = countOf('empty');
  const statusSegments: BarSegment[] = (['safe', 'belowMin', 'empty'] as const).map((status) => ({
    key: status,
    label: t(`detail.stockStatus.${status}`),
    value: countOf(status),
    color: STATUS_COLOR[status],
  }));
  const short = warehouse.belowMinCount > 0;
  let shortHint: string | undefined;
  if (emptyCount > 0) shortHint = t('detail.stats.emptyCount', { count: emptyCount });
  else if (short) shortHint = t('detail.stats.restock');
  else if (stockReady && stock.length > 0) shortHint = t('detail.stats.allSafe');

  return (
    <MetricGrid>
      <MetricCard
        icon={IconPackage}
        label={t('detail.stats.items')}
        value={numberFormat(warehouse.itemCount)}
        hint={
          stockReady
            ? stock.length > 0
              ? t('detail.stats.inStock', { count: inStock, total: stock.length })
              : t('detail.stats.noProducts')
            : undefined
        }
        visual={
          stockReady && stock.length > 0 ? (
            <RingStat
              percent={stockedPercent}
              aria-label={t('detail.stats.inStockShare', { percent: stockedPercent })}
            />
          ) : undefined
        }
      />
      {warehouse.inventoryValue !== null && (
        <MetricCard
          icon={IconCoin}
          label={t('detail.stats.value')}
          value={formatCurrency(warehouse.inventoryValue)}
          hint={
            stockReady
              ? t('detail.stats.valueHint', {
                  count: stock.filter((item) => (item.value ?? 0) > 0).length,
                })
              : undefined
          }
          wideVisual
          visual={
            stockReady && byProduct.length > 0 ? (
              <ShareVisual segments={byProduct} label={t('detail.stats.valueByProduct')} />
            ) : undefined
          }
        />
      )}
      <MetricCard
        icon={IconAlertTriangle}
        label={t('detail.stats.belowMin')}
        value={numberFormat(warehouse.belowMinCount)}
        hint={shortHint}
        tone={short ? 'warning' : 'default'}
        wideVisual
        visual={
          stockReady && stock.length > 0 ? (
            <ShareVisual segments={statusSegments} label={t('detail.stats.statusSplit')} />
          ) : undefined
        }
      />
    </MetricGrid>
  );
}
