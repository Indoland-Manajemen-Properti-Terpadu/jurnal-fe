import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCount, formatIDR } from '@/module/sales/domain/saleFormat';
import type { AmountCount } from '@/module/sales/domain/saleDocument';
import type { OrderSummary } from '@/module/sales/domain/saleOrder';

const Stat = ({
  label,
  figure,
  loading,
  countLabel,
}: Readonly<{ label: string; figure?: AmountCount; loading?: boolean; countLabel: string }>) => (
  <Stack gap={2} style={{ flex: '1 1 200px' }}>
    <Text size="xs" fw={700} c="dimmed">
      {label}
    </Text>
    {loading ? (
      <Skeleton height={26} width={140} radius="sm" />
    ) : (
      <Text fw={700} fz={22} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatIDR(figure?.amount)}
      </Text>
    )}
    <Text size="xs" c="dimmed">
      {countLabel.replace('{count}', formatCount(figure?.count ?? 0))}
    </Text>
  </Stack>
);

/** What waits for the customer, what is ready to invoice, and what already was. */
export function OrderSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: OrderSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('salesOrders');
  const countLabel = t('summary.count', { count: '{count}' });

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group gap="xl" align="flex-start" wrap="wrap">
        <Stat
          loading={isLoading}
          label={t('summary.awaiting')}
          figure={summary?.awaiting}
          countLabel={countLabel}
        />
        <Stat
          loading={isLoading}
          label={t('summary.ready')}
          figure={summary?.ready}
          countLabel={countLabel}
        />
        <Stat
          loading={isLoading}
          label={t('summary.invoiced')}
          figure={summary?.invoiced}
          countLabel={countLabel}
        />
      </Group>
    </Paper>
  );
}
