import { Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { AmountCount } from '@/module/sales/domain/saleDocument';
import { formatCount, formatIDR } from '@/module/sales/domain/saleFormat';
import type { ReturnSummary } from '@/module/sales/domain/saleReturn';

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

/** Returns issued this month, credit still owed to customers, and drafts waiting to be issued. */
export function ReturnSummaryStrip({
  summary,
  isLoading,
}: Readonly<{ summary?: ReturnSummary; isLoading?: boolean }>) {
  const { t } = useTranslation('salesReturns');
  const countLabel = t('summary.count', { count: '{count}' });

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Group gap="xl" align="flex-start" wrap="wrap">
        <Stat
          loading={isLoading}
          label={t('summary.thisMonth')}
          figure={summary?.thisMonth}
          countLabel={countLabel}
        />
        <Stat
          loading={isLoading}
          label={t('summary.credit')}
          figure={summary?.credit}
          countLabel={countLabel}
        />
        <Stat
          loading={isLoading}
          label={t('summary.waiting')}
          figure={summary?.waiting}
          countLabel={countLabel}
        />
      </Group>
    </Paper>
  );
}
