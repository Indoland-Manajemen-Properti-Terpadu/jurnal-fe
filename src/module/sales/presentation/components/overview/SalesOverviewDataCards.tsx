import { Avatar, Progress, Stack, Text } from '@mantine/core';
import { IconGift } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { SalesOverview } from '@/module/sales/domain/salesOverview';
import {
  formatOverviewCompactMoney,
  formatOverviewCount,
  formatOverviewMoney,
} from './salesOverviewFormat';
import { OverviewPanel } from './OverviewPanel';
import { SegmentBar } from '../shared/SegmentBar';
import classes from './SalesOverview.module.css';

export function SalesOverviewAging({ data }: Readonly<{ data: SalesOverview }>) {
  const { t, currentLanguage } = useTranslation('sales');
  const parts = [
    {
      key: 'current',
      label: t('overview.aging.current'),
      value: data.aging.current,
      color: 'var(--mantine-color-blue-6)',
    },
    {
      key: 'days1to30',
      label: t('overview.aging.days1to30'),
      value: data.aging.days1to30,
      color: 'var(--mantine-color-yellow-6)',
    },
    {
      key: 'days31to60',
      label: t('overview.aging.days31to60'),
      value: data.aging.days31to60,
      color: 'var(--mantine-color-orange-6)',
    },
    {
      key: 'days61to90',
      label: t('overview.aging.days61to90'),
      value: data.aging.days61to90,
      color: 'var(--mantine-color-red-4)',
    },
    {
      key: 'over90',
      label: t('overview.aging.over90'),
      value: data.aging.over90,
      color: 'var(--mantine-color-red-7)',
    },
  ];

  return (
    <OverviewPanel title={t('overview.aging.title')} caption={t('overview.aging.caption')}>
      <Stack gap="sm">
        <SegmentBar
          trackColor="var(--mantine-color-gray-3)"
          aria-label={t('overview.aging.chartLabel')}
          segments={parts}
        />
        <div className={classes.agingRows}>
          {parts.map((part) => (
            <div key={part.key} className={classes.valueRow}>
              <Text size="xs" c="dimmed">
                {part.label}
              </Text>
              <Text size="sm" fw={600} className={classes.money}>
                {formatOverviewMoney(part.value, data.precision, currentLanguage)}
              </Text>
            </div>
          ))}
        </div>
      </Stack>
    </OverviewPanel>
  );
}

export function SalesOverviewCustomers({ data }: Readonly<{ data: SalesOverview }>) {
  const { t, currentLanguage } = useTranslation('sales');

  return (
    <OverviewPanel title={t('overview.customers.title')} caption={t('overview.customers.caption')}>
      {data.customers.length === 0 ? (
        <Text size="sm" c="dimmed" py="xl" ta="center">
          {t('overview.customers.empty')}
        </Text>
      ) : (
        <div className={classes.customerRows}>
          {data.customers.map((customer) => (
            <div key={customer.id} className={classes.customerRow}>
              <div className={classes.customerIdentity}>
                <Avatar size="sm" radius="xl" color="primary" variant="light">
                  {customer.name.trim().slice(0, 1).toUpperCase()}
                </Avatar>
                <div style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} className={classes.customerName} title={customer.name}>
                    {customer.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('overview.customers.invoices', {
                      count: formatOverviewCount(customer.count, currentLanguage),
                    })}
                    {customer.overdueCount > 0 && (
                      <>
                        {' · '}
                        {t('overview.customers.overdue', {
                          count: formatOverviewCount(customer.overdueCount, currentLanguage),
                        })}
                      </>
                    )}
                  </Text>
                </div>
              </div>
              <Text size="sm" fw={600} className={classes.customerBalance}>
                {formatOverviewCompactMoney(customer.amount, currentLanguage)}
              </Text>
              <div className={classes.customerProgress}>
                <Progress
                  value={Math.min(100, Math.max(0, customer.share))}
                  size="xs"
                  radius="xl"
                  color="primary"
                  aria-label={t('overview.customers.share', {
                    share: formatOverviewCount(customer.share, currentLanguage),
                  })}
                />
                <Text size="xs" c="dimmed">
                  {t('overview.customers.share', {
                    share: formatOverviewCount(customer.share, currentLanguage),
                  })}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </OverviewPanel>
  );
}

export function SalesOverviewCredit({ data }: Readonly<{ data: SalesOverview }>) {
  const { t, currentLanguage } = useTranslation('sales');

  return (
    <OverviewPanel title={t('overview.credit.title')} caption={t('overview.credit.caption')}>
      {data.credit.count === 0 ? (
        <EmptyState
          title={t('overview.credit.emptyTitle')}
          description={t('overview.credit.emptyDescription')}
          icon={<IconGift size={30} />}
          py="md"
        />
      ) : (
        <Stack gap="xs">
          <Text fz="var(--jurnal-text-2xl)" fw={700} className={classes.money}>
            {formatOverviewMoney(data.credit.amount, data.precision, currentLanguage)}
          </Text>
          <Text size="sm" c="dimmed">
            {t('overview.credit.count', {
              count: formatOverviewCount(data.credit.count, currentLanguage),
            })}
          </Text>
        </Stack>
      )}
    </OverviewPanel>
  );
}
