import { Group, Progress, Stack, Text } from '@mantine/core';
import { IconBuildingStore, IconChartBar, IconCoins } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DashboardSummary } from '@/module/purchases/domain/dashboard';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import classes from './DashboardInsights.module.css';

const compactAmount = (amount: number) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount);

export const TopVendorsCard = ({
  payables,
  onOpenVendor,
}: Readonly<{
  payables: NonNullable<DashboardSummary['payables']>;
  onOpenVendor?: (id: string) => void;
}>) => {
  const { t } = useTranslation('purchases');
  const vendors = payables.topVendors ?? [];
  return (
    <SectionCard
      icon={IconBuildingStore}
      plain
      title={t('hub.overview.topVendorsTitle')}
      subtitle={t('hub.overview.topVendorsSubtitle')}
      count={t('hub.overview.vendorCount', { count: payables.vendorCount ?? vendors.length })}
    >
      {vendors.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('hub.overview.noTopVendors')}
        </Text>
      )}
      {vendors.map((row) => (
        <button
          key={row.vendor.id}
          type="button"
          className={classes.vendor}
          disabled={!onOpenVendor}
          onClick={() => onOpenVendor?.(row.vendor.id)}
        >
          <span className={classes.avatar} aria-hidden>
            {row.vendor.name
              .replace(/^(PT\.?|CV\.?|Toko)\s+/i, '')
              .split(' ')
              .filter(Boolean)
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase()}
          </span>
          <span className={classes.vendorDetails}>
            <span className={classes.vendorTop}>
              <Text size="sm" fw={600} truncate>
                {row.vendor.name}
              </Text>
              <Text size="sm" fw={700}>
                {compactAmount(row.amount)}
              </Text>
            </span>
            <span className={classes.vendorMeta}>
              <Text size="xs" c="dimmed">
                {t('hub.overview.billCount', { count: row.billCount })}
              </Text>
              <Text size="xs" fw={600}>
                {row.percent}%
              </Text>
            </span>
            <Progress value={row.percent} size={6} color="primary" aria-label={`${row.percent}%`} />
          </span>
        </button>
      ))}
    </SectionCard>
  );
};

export const VendorCreditsCard = ({
  credits,
  precision,
}: Readonly<{ credits: NonNullable<DashboardSummary['vendorCredits']>; precision: number }>) => {
  const { t } = useTranslation('purchases');
  const groups = [
    ['advances', credits.advances],
    ['returnCredits', credits.returnCredits],
    ['pendingRefunds', credits.pendingRefunds],
  ] as const;
  const empty = groups.every(([, group]) => group.amount === 0 && group.count === 0);
  return (
    <SectionCard
      icon={IconCoins}
      plain
      title={t('hub.overview.vendorCreditsTitle')}
      subtitle={t('hub.overview.vendorCreditsSubtitle')}
    >
      {empty ? (
        <Stack gap={2}>
          <Text fw={600}>{t('hub.overview.vendorCreditsEmpty')}</Text>
          <Text size="xs" c="dimmed">
            {t('hub.overview.vendorCreditsEmptyHint')}
          </Text>
        </Stack>
      ) : (
        groups.map(([key, group]) => (
          <Group key={key} justify="space-between" gap="sm">
            <Text size="sm">
              {t(`hub.overview.credits.${key}`)} · {group.count}
            </Text>
            <Text size="sm" fw={700}>
              {formatAmount(group.amount, precision)}
            </Text>
          </Group>
        ))
      )}
    </SectionCard>
  );
};

export const PurchaseMonthCard = ({
  period,
  precision,
}: Readonly<{ period: NonNullable<DashboardSummary['purchaseMonth']>; precision: number }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const maximum = Math.max(period.current.amount, period.previousComparable.amount, 1);
  const month = new Intl.DateTimeFormat(currentLanguage === 'id' ? 'id-ID' : 'en-US', {
    month: 'short',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());
  const start = formatDay(period.current.startDate, currentLanguage);
  const end = formatDay(period.current.endDate, currentLanguage);
  const hasRange = start !== '-' && end !== '-';
  return (
    <SectionCard
      icon={IconChartBar}
      plain
      title={t('hub.overview.purchaseMonthTitle', { month })}
      subtitle={
        hasRange
          ? t('hub.overview.purchaseMonthSubtitle', { start, end })
          : t('hub.overview.purchaseMonthSubtitleWithoutDates')
      }
    >
      <Text fw={700} size="xl">
        {compactAmount(period.current.amount)}
      </Text>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {t('hub.overview.currentPeriod')}
          </Text>
          <Text size="xs">{formatAmount(period.current.amount, precision)}</Text>
        </Group>
        <Progress value={(period.current.amount / maximum) * 100} color="primary" />
        <Group justify="space-between">
          <Text size="xs" c="dimmed">
            {t('hub.overview.previousComparable')}
          </Text>
          <Text size="xs">{formatAmount(period.previousComparable.amount, precision)}</Text>
        </Group>
        <Progress value={(period.previousComparable.amount / maximum) * 100} color="gray" />
      </Stack>
      <Text size="xs" c="dimmed">
        {period.percentOfPreviousMonth === null
          ? t('hub.overview.previousMonthWithoutPercent', {
              amount: formatAmount(period.previousMonth.amount, precision),
            })
          : t('hub.overview.previousMonthFull', {
              amount: formatAmount(period.previousMonth.amount, precision),
              percent: period.percentOfPreviousMonth,
            })}
      </Text>
    </SectionCard>
  );
};
