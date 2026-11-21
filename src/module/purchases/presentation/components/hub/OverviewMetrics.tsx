import { Skeleton } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { DashboardActions, DashboardSummary } from '@/module/purchases/domain/dashboard';
import {
  MetricCard,
  MetricGrid,
} from '@/module/purchases/presentation/components/shared/MetricCard';
import {
  AGING_COLOR,
  RingStat,
  SegmentBar,
} from '@/module/purchases/presentation/components/shared/visuals';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface OverviewMetricsProps {
  summary: DashboardSummary | undefined;
  actions: DashboardActions | undefined;
  isLoading: boolean;
  /** Opens the payables report; absent for people without the report right. */
  onOpenReport?: () => void;
  onOpenReady?: () => void;
}

/** The figures that change what the user does next, shown at the top of the overview. */
export const OverviewMetrics = ({
  summary,
  actions,
  isLoading,
  onOpenReport,
  onOpenReady,
}: Readonly<OverviewMetricsProps>) => {
  const { t } = useTranslation('purchases');

  if (isLoading) {
    return (
      <MetricGrid>
        {Array.from({ length: 4 }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={index} height={104} radius="md" />
        ))}
      </MetricGrid>
    );
  }

  const payables = summary?.payables ?? null;
  const ready = summary?.readyToPay;

  return (
    <MetricGrid>
      {payables && (
        <>
          <MetricCard
            label={t('hub.overview.outstanding')}
            value={formatAmount(payables.total)}
            hint={t('hub.overview.outstandingHint', { count: payables.billCount })}
            onClick={onOpenReport}
            visual={
              <SegmentBar
                aria-label={t('hub.overview.agingTitle')}
                segments={[
                  {
                    key: 'current',
                    value: payables.total - payables.overdue,
                    color: AGING_COLOR.current,
                  },
                  { key: 'late', value: payables.overdue, color: AGING_COLOR.days31to60 },
                ]}
              />
            }
          />
          <MetricCard
            label={t('hub.overview.overdue')}
            value={formatAmount(payables.overdue)}
            hint={t('hub.overview.overdueShare', { percent: payables.overduePercent })}
            tone={payables.overdue > 0 ? 'danger' : 'default'}
            onClick={onOpenReport}
            visual={
              <RingStat
                percent={payables.overduePercent}
                danger={payables.overdue > 0}
                aria-label={`${t('hub.overview.overdue')} ${payables.overduePercent}%`}
              />
            }
          />
        </>
      )}
      {actions && (
        <MetricCard
          label={t('hub.overview.actionsCount')}
          value={String(actions.total)}
          hint={
            actions.late > 0
              ? t('hub.overview.actionsLate', { count: actions.late })
              : t('hub.overview.actionsOnTime')
          }
          tone={actions.late > 0 ? 'danger' : 'default'}
        />
      )}
      {ready && ready.count > 0 && (
        <MetricCard
          label={t('hub.overview.readyToPay')}
          value={formatAmount(ready.amount)}
          hint={t('hub.overview.readyToPayHint', { count: ready.count })}
          onClick={onOpenReady}
        />
      )}
    </MetricGrid>
  );
};
