import { Box, Button, Grid, Group, Paper, Skeleton, Stack, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconCalendar, IconCoin, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type {
  ReceivableAgingFilter,
  ReceivableAgingKey,
  ReceivablesOverview,
} from '@/module/sales/domain/saleReceivables';
import { shareLabel } from '@/module/sales/domain/saleReceivables';
import { formatCompactIDR, formatCount, formatIDR } from '@/module/sales/domain/saleFormat';
import { ReceivablesReconciliationPanel } from './ReceivablesReconciliationPanel';
import { StatCard, StatCardRow } from '../shared/StatCard';

const AGING_ORDER: ReceivableAgingKey[] = [
  'current',
  'days1to30',
  'days31to60',
  'days61to90',
  'over90',
];
const AGING_COLORS: Record<ReceivableAgingKey, string> = {
  current: 'var(--mantine-color-green-5)',
  days1to30: 'var(--mantine-color-yellow-5)',
  days31to60: 'var(--mantine-color-orange-5)',
  days61to90: 'var(--mantine-color-red-4)',
  over90: 'var(--mantine-color-red-6)',
};

function AgingPanel({
  overview,
  loading,
  onAgingClick,
}: Readonly<{
  overview?: ReceivablesOverview;
  loading: boolean;
  onAgingClick: (aging: ReceivableAgingFilter) => void;
}>) {
  const { t } = useTranslation('salesReceivables');
  const total = overview?.summary.total.amount ?? 0;

  return (
    <Paper withBorder radius="lg" p="md" bg="white" h="100%">
      <Stack gap="md">
        <div>
          <Title order={3} fz="md">
            {t('aging.title')}
          </Title>
          <Text size="xs" c="dimmed">
            {t('aging.description')}
          </Text>
        </div>

        {loading ? (
          <Stack gap="sm">
            <Skeleton height={10} radius="xl" />
            {AGING_ORDER.map((key) => (
              <Skeleton key={key} height={30} radius="sm" />
            ))}
          </Stack>
        ) : (
          <>
            <Box
              style={{
                display: 'flex',
                height: 8,
                overflow: 'hidden',
                borderRadius: 99,
                background: 'var(--mantine-color-gray-1)',
              }}
              aria-label={t('aging.title')}
            >
              {AGING_ORDER.map((key) => {
                const amount = overview?.aging[key].amount ?? 0;
                const width = total > 0 ? (amount / total) * 100 : 0;
                return (
                  <Box
                    key={key}
                    style={{
                      width: `${width}%`,
                      minWidth: width > 0 ? 3 : 0,
                      background: AGING_COLORS[key],
                    }}
                  />
                );
              })}
            </Box>

            <Stack gap={2}>
              {AGING_ORDER.map((key) => {
                const amount = overview?.aging[key].amount ?? 0;
                const count = overview?.aging[key].count ?? 0;
                const share = amount > 0 ? shareLabel(amount, total) : null;
                return (
                  <Button
                    key={key}
                    variant="subtle"
                    color="dark"
                    h="auto"
                    p="xs"
                    onClick={() => onAgingClick(key)}
                    styles={{
                      root: { width: '100%', height: 'auto' },
                      inner: { width: '100%', justifyContent: 'flex-start' },
                      label: { width: '100%' },
                    }}
                  >
                    <Group justify="space-between" gap="xs" wrap="nowrap" w="100%">
                      <Group gap="xs" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                        <Box
                          w={8}
                          h={8}
                          style={{
                            flex: '0 0 auto',
                            borderRadius: 99,
                            background: AGING_COLORS[key],
                          }}
                        />
                        <Text size="xs" c="dimmed" truncate>
                          {t(`aging.${key}`)}
                        </Text>
                      </Group>
                      <Text size="xs" c="dimmed" ta="right" w={72} visibleFrom="sm">
                        {count > 0 ? t('aging.invoiceCount', { count: formatCount(count) }) : '—'}
                      </Text>
                      <Text size="sm" fw={700} ta="right" w={132} style={{ whiteSpace: 'nowrap' }}>
                        {amount > 0 ? formatIDR(amount) : '—'}
                      </Text>
                      <Text size="xs" c="dimmed" ta="right" w={34} visibleFrom="sm">
                        {share ? `${share}%` : '—'}
                      </Text>
                    </Group>
                  </Button>
                );
              })}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  );
}

export function ReceivablesSummary({
  overview,
  loading,
  asOf,
  onAgingClick,
}: Readonly<{
  overview?: ReceivablesOverview;
  loading: boolean;
  asOf: string;
  onAgingClick: (aging: ReceivableAgingFilter) => void;
}>) {
  const { t } = useTranslation('salesReceivables');
  const summary = overview?.summary;

  return (
    <Stack gap="md">
      <StatCardRow columns={4}>
        <StatCard
          label={t('summary.total')}
          value={formatCompactIDR(summary?.total.amount)}
          caption={t('summary.openInvoices', { count: formatCount(summary?.total.count || 0) })}
          icon={<IconReceipt2 size={22} />}
          loading={loading}
          compact
        />
        <StatCard
          label={t('summary.overdue')}
          value={formatCompactIDR(summary?.overdue.amount)}
          caption={t('summary.overdueHelp', {
            count: formatCount(summary?.overdue.count || 0),
            days: formatCount(summary?.overdue.oldestDays || 0),
          })}
          icon={<IconAlertTriangle size={22} />}
          tone="red"
          loading={loading}
          compact
        />
        <StatCard
          label={t('summary.dueSoon')}
          value={formatCompactIDR(summary?.dueInSevenDays.amount)}
          caption={
            summary?.dueInSevenDays.count
              ? t('summary.dueSoonHelp', {
                  count: formatCount(summary.dueInSevenDays.count),
                })
              : t('summary.dueSoonEmpty')
          }
          icon={<IconCalendar size={22} />}
          tone="orange"
          loading={loading}
          compact
        />
        <StatCard
          label={t('summary.credit')}
          value={formatCompactIDR(summary?.customerCredit.amount)}
          caption={t('summary.creditHelp', {
            count: formatCount(summary?.customerCredit.customerCount || 0),
          })}
          icon={<IconCoin size={22} />}
          loading={loading}
          compact
        />
      </StatCardRow>

      <Grid gutter="md" align="stretch">
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <AgingPanel overview={overview} loading={loading} onAgingClick={onAgingClick} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          <ReceivablesReconciliationPanel
            overview={overview}
            loading={loading}
            asOf={asOf}
          />
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
