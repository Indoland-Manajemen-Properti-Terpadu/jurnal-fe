import { useTranslation } from '@/i18n';
import { overdueAmount } from '@/module/purchases/domain/payablesView';
import type { PayablesAging } from '@/module/purchases/domain/purchaseDocuments';
import {
  MetricCard,
  MetricGrid,
} from '@/module/purchases/presentation/components/shared/MetricCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import {
  AGING_COLOR,
  MiniBars,
  RingStat,
  SegmentBar,
} from '@/module/purchases/presentation/components/shared/visuals';

const TOP_VENDORS = 5;

/** What is owed, how much is already late, and how concentrated it is across vendors. */
export const PayablesKpis = ({ data }: Readonly<{ data: PayablesAging }>) => {
  const { t } = useTranslation('purchases');
  const { totals, rows } = data;
  const overdue = overdueAmount(totals);
  const percent =
    totals.totalRemaining > 0 ? Math.round((overdue / totals.totalRemaining) * 100) : 0;
  const top = [...rows].sort((a, b) => b.totalRemaining - a.totalRemaining);
  const largest = top[0];
  const largestShare =
    largest && totals.totalRemaining > 0
      ? Math.round((largest.totalRemaining / totals.totalRemaining) * 100)
      : 0;

  return (
    <MetricGrid columns={3}>
      <MetricCard
        label={t('reports.kpi.totalOwed')}
        value={formatAmount(totals.totalRemaining)}
        hint={t('reports.kpi.totalOwedHint', { count: totals.billCount })}
        visual={
          <SegmentBar
            aria-label={t('reports.kpi.totalOwed')}
            segments={[
              { key: 'current', value: totals.current, color: AGING_COLOR.current },
              { key: 'late', value: overdue, color: AGING_COLOR.days31to60 },
            ]}
          />
        }
      />
      <MetricCard
        label={t('reports.kpi.overdue')}
        value={formatAmount(overdue)}
        tone={overdue > 0 ? 'danger' : 'default'}
        hint={
          overdue > 0 ? t('reports.kpi.overdueHint', { percent }) : t('reports.kpi.overdueNone')
        }
        visual={
          <RingStat
            percent={percent}
            danger={overdue > 0}
            aria-label={`${t('reports.kpi.overdue')} ${percent}%`}
          />
        }
      />
      <MetricCard
        label={t('reports.kpi.vendors')}
        value={String(rows.length)}
        hint={
          largest
            ? t('reports.kpi.vendorsHint', { name: largest.vendorName, percent: largestShare })
            : t('reports.kpi.vendorsNone')
        }
        visual={
          <MiniBars
            aria-label={t('reports.kpi.vendors')}
            values={top.slice(0, TOP_VENDORS).map((row) => row.totalRemaining)}
          />
        }
      />
    </MetricGrid>
  );
};
