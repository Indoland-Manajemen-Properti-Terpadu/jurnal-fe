import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCount, formatIDR } from '@/module/sales/domain/saleFormat';
import type { QuoteSummary } from '@/module/sales/domain/saleQuote';

const Stat = ({
  label,
  value,
  hint,
  loading,
}: Readonly<{ label: string; value: string; hint: string; loading?: boolean }>) => (
  <Stack gap={2} style={{ flex: '1 1 200px' }}>
    <Text size="xs" fw={700} c="dimmed">
      {label}
    </Text>
    {loading ? (
      <Skeleton height={26} width={140} radius="sm" />
    ) : (
      <Text fw={700} fz={22} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Text>
    )}
    <Text size="xs" c="dimmed">
      {hint}
    </Text>
  </Stack>
);

/** Three figures that change what the user does next: what waits, what was won, how often. */
export function QuoteSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: QuoteSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('salesQuotes');
  const rate = summary?.conversionRate;

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group gap="xl" align="flex-start" wrap="wrap">
        <Stat
          loading={isLoading}
          label={t('summary.awaiting')}
          value={formatIDR(summary?.awaiting.amount)}
          hint={t('summary.awaitingCount', { count: formatCount(summary?.awaiting.count ?? 0) })}
        />
        <Stat
          loading={isLoading}
          label={t('summary.accepted')}
          value={formatIDR(summary?.accepted.amount)}
          hint={t('summary.acceptedCount', { count: formatCount(summary?.accepted.count ?? 0) })}
        />
        <Stat
          loading={isLoading}
          label={t('summary.conversion')}
          value={typeof rate === 'number' ? `${Math.round(rate * 100)}%` : '–'}
          hint={
            typeof rate === 'number' ? t('summary.conversionHint') : t('summary.conversionNone')
          }
        />
      </Group>
    </Paper>
  );
}
