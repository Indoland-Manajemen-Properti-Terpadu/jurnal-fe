import { Button, Progress, Stack, Text } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { SalesOverview } from '@/module/sales/domain/salesOverview';
import {
  formatOverviewCompactMoney,
  formatOverviewCount,
  formatOverviewMoney,
  formatOverviewPercent,
  overviewMonthLabels,
  overviewMonthProgress,
} from './salesOverviewFormat';
import { OverviewPanel } from './OverviewPanel';
import { SegmentBar } from '../shared/SegmentBar';
import classes from './SalesOverview.module.css';

export function SalesOverviewMonthly({ data }: Readonly<{ data: SalesOverview }>) {
  const { t, currentLanguage } = useTranslation('sales');
  const labels = overviewMonthLabels(data.asOf, currentLanguage);
  const progress = overviewMonthProgress(data.monthly.current, data.monthly.previousFull);
  const previousProgress = overviewMonthProgress(
    data.monthly.previousComparable,
    data.monthly.previousFull
  );
  const comparison =
    data.monthly.previousFull <= 0 ? 0 : (data.monthly.current / data.monthly.previousFull) * 100;

  return (
    <OverviewPanel
      title={t('overview.monthly.title', { month: labels.currentMonth })}
      caption={t('overview.monthly.caption')}
    >
      <Stack gap="sm">
        <div className={classes.monthMetric}>
          <Text fz="var(--jurnal-text-2xl)" fw={700} className={classes.money}>
            {formatOverviewCompactMoney(data.monthly.current, currentLanguage)}
          </Text>
          <Text size="xs" c="dimmed">
            {t('overview.monthly.invoices', {
              count: formatOverviewCount(data.monthly.invoiceCount, currentLanguage),
            })}
          </Text>
        </div>

        <div className={classes.monthCompare}>
          <div className={classes.valueRow}>
            <Text size="xs" c="dimmed">
              {t('overview.monthly.current', { range: labels.currentRange })}
            </Text>
            <Text size="xs" fw={600} className={classes.money}>
              {formatOverviewCompactMoney(data.monthly.current, currentLanguage)}
            </Text>
          </div>
          <Progress
            value={progress}
            size="sm"
            radius="xl"
            color="primary"
            aria-label={t('overview.monthly.chartLabel')}
          />
          <div className={classes.valueRow}>
            <Text size="xs" c="dimmed">
              {t('overview.monthly.previousComparable', { range: labels.previousComparableRange })}
            </Text>
            <Text size="xs" fw={600} className={classes.money}>
              {formatOverviewCompactMoney(data.monthly.previousComparable, currentLanguage)}
            </Text>
          </div>
          <Progress
            value={previousProgress}
            size="sm"
            radius="xl"
            color="gray"
            aria-label={t('overview.monthly.previousChartLabel')}
          />
        </div>
        <Text size="xs" c="dimmed">
          {t('overview.monthly.previousFull', { month: labels.previousMonth })}:{' '}
          {formatOverviewCompactMoney(data.monthly.previousFull, currentLanguage)}
        </Text>
        {data.monthly.previousFull > 0 ? (
          <Text size="xs" c="dimmed">
            {t('overview.monthly.comparison', {
              percent: formatOverviewPercent(comparison, currentLanguage),
            })}
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            {t('overview.monthly.noPrevious')}
          </Text>
        )}
      </Stack>
    </OverviewPanel>
  );
}

export function SalesOverviewQuotes({ data }: Readonly<{ data: SalesOverview }>) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('sales');
  const completed = data.quotes.accepted + data.quotes.rejected + data.quotes.expired;
  const outcomes = [
    { key: 'accepted', count: data.quotes.accepted, color: 'var(--mantine-color-green-6)' },
    { key: 'rejected', count: data.quotes.rejected, color: 'var(--mantine-color-red-5)' },
    { key: 'expired', count: data.quotes.expired, color: 'var(--mantine-color-orange-5)' },
  ] as const;

  return (
    <OverviewPanel
      title={t('overview.quotes.title')}
      caption={t('overview.quotes.caption')}
      action={
        <Button
          size="xs"
          variant="subtle"
          rightSection={<IconChevronRight size={14} />}
          onClick={() => navigate(routes.sales.quotations)}
        >
          {t('overview.quotes.all')}
        </Button>
      }
    >
      <Stack gap="sm">
        <Text fz="var(--jurnal-text-2xl)" fw={700} className={classes.money}>
          {formatOverviewPercent(data.quotes.conversionRate, currentLanguage)}%
        </Text>
        <Text size="xs" c="dimmed">
          {t('overview.quotes.converted', {
            accepted: formatOverviewCount(data.quotes.accepted, currentLanguage),
            completed: formatOverviewCount(completed, currentLanguage),
          })}
        </Text>
        <div className={classes.quoteTrack}>
          <SegmentBar
            aria-label={t('overview.quotes.chartLabel')}
            trackColor="var(--mantine-color-gray-3)"
            segments={outcomes.map((outcome) => ({
              key: outcome.key,
              label: t(`overview.quotes.${outcome.key}`),
              value: outcome.count,
              color: outcome.color,
            }))}
          />
        </div>
        <div className={classes.quoteRows}>
          {outcomes.map((outcome) => (
            <div key={outcome.key} className={classes.valueRow}>
              <Text size="xs" c="dimmed">
                {t(`overview.quotes.${outcome.key}`)}
              </Text>
              <Text size="sm" fw={600}>
                {formatOverviewCount(outcome.count, currentLanguage)}
              </Text>
            </div>
          ))}
          <div className={classes.valueRow}>
            <Text size="xs" c="dimmed">
              {t('overview.quotes.awaiting')}
            </Text>
            <Text size="sm" fw={600}>
              {t('overview.quotes.awaitingAmount', {
                count: formatOverviewCount(data.quotes.awaiting, currentLanguage),
                amount: formatOverviewMoney(
                  data.quotes.awaitingAmount,
                  data.precision,
                  currentLanguage
                ),
              })}
            </Text>
          </div>
        </div>
      </Stack>
    </OverviewPanel>
  );
}
