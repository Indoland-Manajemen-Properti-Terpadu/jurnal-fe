import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCount, formatIDR } from '@/module/sales/domain/saleFormat';
import type { SalePaymentSummary } from '@/module/sales/domain/salePaymentList';

const Stat = ({
  label,
  amount,
  caption,
  loading,
}: Readonly<{ label: string; amount?: number; caption?: string; loading?: boolean }>) => (
  <Stack gap={2} style={{ flex: '1 1 200px' }}>
    <Text size="xs" fw={700} c="dimmed">
      {label}
    </Text>
    {loading ? (
      <Skeleton height={26} width={140} radius="sm" />
    ) : (
      <Text fw={700} fz={22} style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatIDR(amount)}
      </Text>
    )}
    {caption && (
      <Text size="xs" c="dimmed">
        {caption}
      </Text>
    )}
  </Stack>
);

/** Received this month, received in total, and the withholding tax taken off payments. */
export function SalePaymentSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: SalePaymentSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('sales');
  const count = (n?: number) => t('payments.summary.count', { count: formatCount(n ?? 0) });
  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group gap="xl" align="flex-start" wrap="wrap">
        <Stat
          loading={isLoading}
          label={t('payments.summary.thisMonth')}
          amount={summary?.thisMonth.amount}
          caption={count(summary?.thisMonth.count)}
        />
        <Stat
          loading={isLoading}
          label={t('payments.summary.total')}
          amount={summary?.total.amount}
          caption={count(summary?.total.count)}
        />
        <Stat
          loading={isLoading}
          label={t('payments.summary.withholding')}
          amount={summary?.withholding}
        />
      </Group>
    </Paper>
  );
}
