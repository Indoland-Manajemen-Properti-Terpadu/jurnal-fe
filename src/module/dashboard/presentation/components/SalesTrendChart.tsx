import { Box, Group, SimpleGrid, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { getTrendTotals } from '@/module/dashboard/domain/dashboardTotals';
import type { MonthlyPoint } from '@/module/dashboard/domain/dashboardTypes';
import classes from './dashboard.module.css';
import { formatCompact, formatIDR } from './dashboardFormat';

/* ---------- 6-Month Billing & Collection Trend Chart ---------- */

export function SalesTrendChart({
  data,
  loading,
}: Readonly<{ data: MonthlyPoint[]; loading?: boolean }>) {
  const { t } = useTranslation('dashboard');

  if (loading) return <Skeleton h={260} radius="lg" />;

  const max = Math.max(1, ...data.map((d) => Math.max(d.invoiced, d.collected)));
  const hasData = data.some((d) => d.invoiced > 0 || d.collected > 0);
  const {
    invoiced: total6mInvoiced,
    collected: total6mCollected,
    uncollected: total6mUncollected,
  } = getTrendTotals(data);

  return (
    <Stack gap="md">
      {/* Top 6-Month Summary Strip */}
      <SimpleGrid
        cols={{ base: 1, xs: 3 }}
        spacing="xs"
        p="xs"
        style={{
          borderRadius: 12,
          backgroundColor: 'color-mix(in srgb, var(--mantine-color-slate-1) 75%, transparent)',
          border: '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
        }}
      >
        <Box px="xs">
          <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
            {t('summary6mInvoiced')}
          </Text>
          <Text size="sm" fw={800} c="primary.8" mt={2}>
            {formatIDR(total6mInvoiced)}
          </Text>
        </Box>
        <Box
          px="xs"
          style={{
            borderLeft:
              '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
            borderRight:
              '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
          }}
        >
          <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
            {t('summary6mCollected')}
          </Text>
          <Text size="sm" fw={800} c="teal.7" mt={2}>
            {formatIDR(total6mCollected)}
          </Text>
        </Box>
        <Box px="xs">
          <Text fz="var(--jurnal-text-xs)" c="dimmed" fw={600}>
            {t('summary6mUncollected')}
          </Text>
          <Text size="sm" fw={800} c={total6mUncollected > 0 ? 'orange.8' : 'dark.8'} mt={2}>
            {formatIDR(total6mUncollected)}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Legend */}
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="lg">
          <Group gap={6}>
            <Box
              w={11}
              h={11}
              style={{ borderRadius: 3, background: 'var(--mantine-color-sky-7)' }}
            />
            <Text size="xs" fw={600} c="dark.6">
              {t('legendInvoiced')}
            </Text>
          </Group>
          <Group gap={6}>
            <Box
              w={11}
              h={11}
              style={{ borderRadius: 3, background: 'var(--mantine-color-teal-6)' }}
            />
            <Text size="xs" fw={600} c="dark.6">
              {t('legendCollected')}
            </Text>
          </Group>
        </Group>
        <Text fz="var(--jurnal-text-xs)" c="dimmed">
          Max: {formatCompact(max)}
        </Text>
      </Group>

      {/* Bar Plot Area */}
      <Box pos="relative" h={195} pt={8}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <Box
            key={g}
            pos="absolute"
            left={0}
            right={0}
            bottom={`${g * 100}%`}
            style={{
              borderTop:
                '1px dashed color-mix(in srgb, var(--mantine-color-slate-9) 8%, transparent)',
            }}
          />
        ))}
        <Group
          h="100%"
          align="flex-end"
          gap={0}
          wrap="nowrap"
          justify="space-around"
          pos="relative"
        >
          {data.map((d) => {
            const monthRate = d.invoiced > 0 ? Math.round((d.collected / d.invoiced) * 100) : 0;
            return (
              <Tooltip
                key={d.key}
                withArrow
                position="top"
                label={
                  <Stack gap={2} p={2}>
                    <Text size="xs" fw={700}>
                      {d.label} ({monthRate}%)
                    </Text>
                    <Text size="xs">
                      {t('legendInvoiced')}: {formatIDR(d.invoiced)}
                    </Text>
                    <Text size="xs">
                      {t('legendCollected')}: {formatIDR(d.collected)}
                    </Text>
                  </Stack>
                }
              >
                <Group
                  gap={5}
                  align="flex-end"
                  h="100%"
                  wrap="nowrap"
                  style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Box
                    className={classes.bar}
                    w={20}
                    h={`${Math.max(3, (d.invoiced / max) * 100)}%`}
                    style={{
                      borderRadius: '8px 8px 4px 4px',
                      background: 'var(--mantine-color-sky-7)',
                    }}
                  />
                  <Box
                    className={classes.bar}
                    w={20}
                    h={`${Math.max(3, (d.collected / max) * 100)}%`}
                    style={{
                      borderRadius: '8px 8px 4px 4px',
                      background: 'var(--mantine-color-teal-6)',
                    }}
                  />
                </Group>
              </Tooltip>
            );
          })}
        </Group>
      </Box>

      {/* X-Axis Labels + Monthly Collection % */}
      <Group gap={0} justify="space-around" wrap="nowrap">
        {data.map((d) => {
          const pct = d.invoiced > 0 ? Math.round((d.collected / d.invoiced) * 100) : 0;
          return (
            <Stack key={d.key} gap={1} align="center" style={{ flex: 1 }}>
              <Text size="xs" fw={600} c="dark.7" ta="center">
                {d.label}
              </Text>
              <Text fz="var(--jurnal-text-xs)" c={pct >= 80 ? 'teal.7' : 'dimmed'} fw={600}>
                {d.invoiced > 0 ? `${pct}%` : '—'}
              </Text>
            </Stack>
          );
        })}
      </Group>

      {!hasData && (
        <Text size="xs" c="dimmed" ta="center">
          {t('noTrendData')}
        </Text>
      )}
    </Stack>
  );
}
