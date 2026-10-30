import { Badge, Box, Group, Progress, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { getAgingTotals } from '@/module/dashboard/domain/dashboardTotals';
import type { AgingBucket } from '@/module/dashboard/domain/dashboardTypes';
import { formatIDR } from './dashboardFormat';

/* ---------- Receivable Aging ---------- */

export function AgingList({
  buckets,
  loading,
}: Readonly<{ buckets: AgingBucket[]; loading?: boolean }>) {
  const { t } = useTranslation('dashboard');

  if (loading) return <Skeleton h={220} radius="lg" />;
  const { amount: total, count: totalCount } = getAgingTotals(buckets);

  return (
    <Stack gap="md">
      {/* Summary Header Box */}
      <Box
        p="sm"
        style={{
          borderRadius: 12,
          backgroundColor: 'rgba(241, 245, 249, 0.75)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Box>
            <Text fz={11} c="dimmed" fw={600} tt="uppercase">
              {t('agingTotalLabel')}
            </Text>
            <Text size="md" fw={800} c="dark.9" mt={2}>
              {formatIDR(total)}
            </Text>
          </Box>
          <Badge variant="light" color="primary" radius="sm">
            {totalCount} {t('invoiceUnit')}
          </Badge>
        </Group>
      </Box>

      {/* Proportional Stacked Bar */}
      <Progress.Root size={14} radius="xl">
        {buckets.map((b) => (
          <Tooltip key={b.key} label={`${b.label}: ${formatIDR(b.amount)}`} withArrow>
            <Progress.Section
              value={total > 0 ? Math.max(b.amount > 0 ? 4 : 0, (b.amount / total) * 100) : 0}
              color={b.color}
            />
          </Tooltip>
        ))}
      </Progress.Root>

      {/* Bucket Breakdown Rows */}
      <Stack gap="xs">
        {buckets.map((b) => {
          const share = total > 0 ? Math.round((b.amount / total) * 100) : 0;
          return (
            <Box
              key={b.key}
              p="xs"
              style={{
                borderRadius: 10,
                border: '1px solid rgba(15, 23, 42, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Box
                    w={10}
                    h={10}
                    bg={`${b.color}.6`}
                    style={{ borderRadius: 999, flexShrink: 0 }}
                  />
                  <Text size="xs" fw={600} c="dark.8" truncate>
                    {b.label}
                  </Text>
                  <Badge size="xs" variant="light" color={b.count > 0 ? b.color : 'gray'}>
                    {b.count}
                  </Badge>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <Text size="xs" fw={700} c={b.amount > 0 ? 'dark.9' : 'dimmed'}>
                    {b.amount > 0 ? formatIDR(b.amount) : '—'}
                  </Text>
                  {b.amount > 0 && (
                    <Text fz={10.5} c="dimmed" w={32} ta="right">
                      ({share}%)
                    </Text>
                  )}
                </Group>
              </Group>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}
