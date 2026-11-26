import { Button, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconChevronRight, IconTruck, IconWallet } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type {
  DashboardActions,
  DashboardSummary,
  DueGroup,
} from '@/module/purchases/domain/dashboard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import classes from './OverviewMetrics.module.css';

interface OverviewMetricsProps {
  summary: DashboardSummary | undefined;
  actions: DashboardActions | undefined;
  isLoading: boolean;
  onOpenReport?: () => void;
  onOpenReady?: () => void;
  onOpenUnbilled?: () => void;
}

const compactAmount = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);

const DueItem = ({
  label,
  group,
  detail,
}: Readonly<{ label: string; group: DueGroup; detail: string }>) => (
  <div className={classes.dueItem}>
    <Text size="xs" c="dimmed">
      {label}
    </Text>
    <Text fw={700} size="lg">
      {compactAmount(group.amount)}
    </Text>
    <Text size="xs" c="dimmed">
      {detail}
    </Text>
  </div>
);

export const OverviewMetrics = ({
  summary,
  actions,
  isLoading,
  onOpenReport,
  onOpenReady,
  onOpenUnbilled,
}: Readonly<OverviewMetricsProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');

  if (isLoading) {
    return (
      <div className={classes.grid}>
        <Skeleton height={210} radius="lg" />
        <Skeleton height={210} radius="lg" />
      </div>
    );
  }

  const payables = summary?.payables;
  const due = payables?.due;
  return (
    <div className={classes.grid}>
      {payables && (
        <Paper withBorder radius="lg" p="lg" className={classes.payables}>
          <div className={classes.heading}>
            <div>
              <Text fw={700}>{t('hub.overview.outstanding')}</Text>
              <Text size="xs" c="dimmed">
                {t('hub.overview.outstandingHint', { count: payables.billCount })}
              </Text>
            </div>
            {onOpenReport && (
              <Button
                variant="default"
                color="dark"
                size="xs"
                rightSection={<IconChevronRight size={14} />}
                onClick={onOpenReport}
              >
                {t('hub.overview.openPayables')}
              </Button>
            )}
          </div>
          <Text className={classes.total} fw={700}>
            {formatAmount(payables.total, summary?.precision)}
          </Text>
          {due && (
            <>
              <div className={classes.bar} aria-hidden>
                <span style={{ width: `${due.overdue.percent}%` }} className={classes.overdue} />
                <span
                  style={{ width: `${due.dueWithin7Days.percent}%` }}
                  className={classes.soon}
                />
                <span
                  style={{ width: `${due.dueAfter7Days.percent}%` }}
                  className={classes.later}
                />
              </div>
              <div className={classes.dueGrid}>
                <DueItem
                  label={t('hub.overview.overdue')}
                  group={due.overdue}
                  detail={t('hub.overview.dueBillsShare', {
                    count: due.overdue.billCount,
                    percent: due.overdue.percent,
                  })}
                />
                <DueItem
                  label={t('hub.overview.dueWithin7')}
                  group={due.dueWithin7Days}
                  detail={
                    due.dueWithin7Days.nearestDueDate
                      ? t('hub.overview.dueNearest', {
                          count: due.dueWithin7Days.billCount,
                          date: formatDay(
                            due.dueWithin7Days.nearestDueDate.slice(0, 10),
                            currentLanguage
                          ),
                        })
                      : t('hub.overview.dueBillCount', { count: due.dueWithin7Days.billCount })
                  }
                />
                <DueItem
                  label={t('hub.overview.dueAfter7')}
                  group={due.dueAfter7Days}
                  detail={t('hub.overview.dueLaterHint')}
                />
              </div>
            </>
          )}
        </Paper>
      )}
      <Paper withBorder radius="lg" p={0} className={classes.actionPanel}>
        <Stack gap={0}>
          {actions && (
            <button
              type="button"
              className={classes.action}
              onClick={() =>
                document.getElementById('purchase-actions')?.scrollIntoView({ behavior: 'smooth' })
              }
            >
              <span className={`${classes.actionIcon} ${classes.actionIconDanger}`}>
                <IconAlertTriangle size={18} aria-hidden />
              </span>
              <span>
                <Text fw={600} size="sm">
                  {t('hub.overview.actionsCount')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('hub.overview.actionsLate', { count: actions.late })}
                </Text>
              </span>
              <Text fw={700} size="xl">
                {actions.total}
              </Text>
              <IconChevronRight size={16} />
            </button>
          )}
          {summary?.unbilledReceipts && (
            <button
              type="button"
              className={classes.action}
              onClick={onOpenUnbilled}
              disabled={!onOpenUnbilled}
            >
              <span className={classes.actionIcon}>
                <IconTruck size={18} aria-hidden />
              </span>
              <span>
                <Text fw={600} size="sm">
                  {t('hub.overview.unbilledReceipts')}
                </Text>
                <Text size="xs" c="dimmed">
                  {t('hub.overview.unbilledReceiptsHint', {
                    count: summary.unbilledReceipts.count,
                  })}
                </Text>
              </span>
              <Text fw={700} size="sm">
                {summary.unbilledReceipts.amount === undefined
                  ? summary.unbilledReceipts.count
                  : compactAmount(summary.unbilledReceipts.amount)}
              </Text>
              <IconChevronRight size={16} />
            </button>
          )}
          {summary?.readyToPay && (
            <button
              type="button"
              className={classes.action}
              onClick={onOpenReady}
              disabled={!onOpenReady}
            >
              <span className={classes.actionIcon}>
                <IconWallet size={18} aria-hidden />
              </span>
              <span>
                <Text fw={600} size="sm">
                  {t('hub.overview.readyToPay')}
                </Text>
                <Text size="xs" c="dimmed">
                  {summary.readyToPay.amount !== undefined
                    ? t('hub.overview.readyToPayAmountHint', {
                        amount: formatAmount(summary.readyToPay.amount, summary.precision),
                      })
                    : t('hub.overview.readyToPayHint', { count: summary.readyToPay.count })}
                </Text>
              </span>
              <Text fw={700} size="xl">
                {summary.readyToPay.count}
              </Text>
              <IconChevronRight size={16} />
            </button>
          )}
        </Stack>
      </Paper>
    </div>
  );
};
