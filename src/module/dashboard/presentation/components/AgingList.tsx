import { Box, Group, Progress, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { getAgingTotals } from '@/module/dashboard/domain/dashboardTotals';
import type { AgingBucket } from '@/module/dashboard/domain/dashboardTypes';
import { formatIDR } from './dashboardFormat';

export function AgingList({
  buckets,
  loading,
}: Readonly<{ buckets: AgingBucket[]; loading?: boolean }>) {
  const { t } = useTranslation('dashboard');
  if (loading) return <Skeleton h={280} radius="md" />;
  const { amount: total, count } = getAgingTotals(buckets);
  return (
    <Stack gap="lg">
      <Group justify="space-between" align="baseline">
        <Text size="xl" fw={700}>
          {formatIDR(total)}
        </Text>
        <Text size="xs" c="dimmed">
          {count} {t('invoiceUnit')}
        </Text>
      </Group>
      {buckets.map((bucket, index) => {
        const share = total > 0 ? (bucket.amount / total) * 100 : 0;
        const color =
          index === 0 ? 'primary.4' : index === buckets.length - 1 ? 'orange.7' : 'primary.6';
        return (
          <Box key={bucket.key}>
            <Group justify="space-between" mb={4}>
              <Text size="xs" c="dimmed">
                {bucket.label}
              </Text>
              <Text size="xs" c="dimmed">
                {bucket.count} {t('invoiceUnit')}
              </Text>
            </Group>
            <Group justify="space-between" mb="xs">
              <Text size="sm" fw={600}>
                {formatIDR(bucket.amount)}
              </Text>
              <Text size="xs" c="dimmed">
                {share.toFixed(0)}%
              </Text>
            </Group>
            <Progress value={share} size={8} radius="sm" color={color} aria-label={bucket.label} />
          </Box>
        );
      })}
    </Stack>
  );
}
