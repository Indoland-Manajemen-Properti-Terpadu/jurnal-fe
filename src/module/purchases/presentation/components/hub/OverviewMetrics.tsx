import { Skeleton } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { overdueAmount } from '@/module/purchases/domain/payablesView';
import type { WorkItem } from '@/module/purchases/domain/purchaseOverview';
import type { OverviewData } from '@/module/purchases/presentation/components/hub/useOverviewData';
import {
  MetricCard,
  MetricGrid,
} from '@/module/purchases/presentation/components/shared/MetricCard';
import {
  AGING_COLOR,
  MiniBars,
  RingStat,
  SegmentBar,
} from '@/module/purchases/presentation/components/shared/visuals';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

const DECISION_REASONS: { reason: WorkItem['reason']; tab: string }[] = [
  { reason: 'approveRequest', tab: 'requests' },
  { reason: 'approveOrder', tab: 'orders' },
  { reason: 'approvePayment', tab: 'payments' },
];

interface OverviewMetricsProps {
  data: OverviewData;
  onOpenReport?: () => void;
  onOpenTab: (tab: 'overview' | 'payments') => void;
}

/** The four figures that change what the user does next, shown above every tab. */
export const OverviewMetrics = ({
  data,
  onOpenReport,
  onOpenTab,
}: Readonly<OverviewMetricsProps>) => {
  const { t } = useTranslation('purchases');
  const { totals } = data;

  if (data.isLoading) {
    return (
      <MetricGrid>
        {Array.from({ length: 4 }, (_, index) => (
          // eslint-disable-next-line react/no-array-index-key
          <Skeleton key={index} height={104} radius="md" />
        ))}
      </MetricGrid>
    );
  }

  const overdue = totals ? overdueAmount(totals) : 0;
  const overduePercent =
    totals && totals.totalRemaining > 0 ? Math.round((overdue / totals.totalRemaining) * 100) : 0;
  const counts = DECISION_REASONS.map(({ reason }) => ({
    reason,
    count: data.items.filter((item) => item.reason === reason).length,
  }));

  return (
    <MetricGrid>
      {totals && (
        <>
          <MetricCard
            label={t('hub.overview.outstanding')}
            value={formatAmount(totals.totalRemaining)}
            hint={t('hub.overview.outstandingHint', { count: totals.billCount })}
            onClick={onOpenReport}
            visual={
              <SegmentBar
                aria-label={t('hub.overview.agingTitle')}
                segments={[
                  { key: 'current', value: totals.current, color: AGING_COLOR.current },
                  { key: 'late', value: overdue, color: AGING_COLOR.days31to60 },
                ]}
              />
            }
          />
          <MetricCard
            label={t('hub.overview.overdue')}
            value={formatAmount(overdue)}
            hint={t('hub.overview.overdueShare', { percent: overduePercent })}
            tone={overdue > 0 ? 'danger' : 'default'}
            onClick={onOpenReport}
            visual={
              <RingStat
                percent={overduePercent}
                danger={overdue > 0}
                aria-label={`${t('hub.overview.overdue')} ${overduePercent}%`}
              />
            }
          />
        </>
      )}
      <MetricCard
        label={t('hub.overview.decisions')}
        value={String(data.decisions)}
        hint={t('hub.overview.decisionsHint')}
        onClick={() => onOpenTab('overview')}
        visual={
          <MiniBars
            values={counts.map((item) => item.count)}
            aria-label={counts
              .map((item) => `${t(`hub.overview.decisionType.${item.reason}`)}: ${item.count}`)
              .join(', ')}
          />
        }
      />
      {data.showReadyToPay && (
        <MetricCard
          label={t('hub.overview.readyToPay')}
          value={String(data.readyToPay)}
          hint={t('hub.overview.readyToPayHint')}
          onClick={() => onOpenTab('payments')}
        />
      )}
    </MetricGrid>
  );
};
