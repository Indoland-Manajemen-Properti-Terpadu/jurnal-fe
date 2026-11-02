import { Box, Group, SimpleGrid, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { getTrendTotals } from '@/module/dashboard/domain/dashboardTotals';
import type { MonthlyPoint } from '@/module/dashboard/domain/dashboardTypes';
import classes from './dashboard.module.css';
import { formatCompact, formatIDR } from './dashboardFormat';

export function SalesTrendChart({
  data,
  loading,
}: Readonly<{ data: MonthlyPoint[]; loading?: boolean }>) {
  const { t, currentLanguage } = useTranslation('dashboard');
  if (loading) return <Skeleton h={280} radius="md" />;
  const max = Math.max(1, ...data.map((d) => Math.max(d.invoiced, d.collected)));
  const hasData = data.some((d) => d.invoiced > 0 || d.collected > 0);
  const totals = getTrendTotals(data);
  const series = [
    { label: t('legendInvoiced'), color: 'var(--mantine-color-primary-6)' },
    { label: t('legendCollected'), color: 'var(--mantine-color-primary-3)' },
  ];
  return (
    <Stack gap="lg">
      <SimpleGrid cols={3} spacing="sm">
        {[
          { label: t('summary6mInvoiced'), value: totals.invoiced },
          { label: t('summary6mCollected'), value: totals.collected },
          { label: t('summary6mUncollected'), value: totals.uncollected },
        ].map((item) => (
          <Box key={item.label}>
            <Text size="xs" c="dimmed">
              {item.label}
            </Text>
            <Text visibleFrom="sm" size="xl" fw={600} className={classes.numeric}>
              {formatIDR(item.value)}
            </Text>
            <Text
              hiddenFrom="sm"
              size="sm"
              fw={600}
              title={formatIDR(item.value)}
              className={classes.numeric}
            >
              {formatCompact(item.value, currentLanguage)}
            </Text>
          </Box>
        ))}
      </SimpleGrid>
      <Group gap="lg">
        {series.map((item) => (
          <Group key={item.label} gap="xs">
            <Box w={12} h={12} bg={item.color} style={{ borderRadius: 4 }} />
            <Text size="xs" c="dimmed">
              {item.label}
            </Text>
          </Group>
        ))}
      </Group>
      {hasData ? (
        <Box>
          <Box className={classes.chartPlot}>
            <Box className={classes.chartAxis} aria-hidden="true">
              {[1, 0.75, 0.5, 0.25, 0].map((share) => (
                <span key={share}>{formatCompact(max * share, currentLanguage)}</span>
              ))}
            </Box>
            <Box className={classes.chartBars}>
              {data.map((point) => {
                const description = `${point.label}: ${series[0].label} ${formatIDR(point.invoiced)}, ${series[1].label} ${formatIDR(point.collected)}`;
                return (
                  <Tooltip
                    key={point.key}
                    label={description}
                    multiline
                    w={240}
                    events={{ hover: true, focus: true, touch: true }}
                  >
                    <button type="button" className={classes.chartColumn} aria-label={description}>
                      {[point.invoiced, point.collected].map((value, index) => (
                        <span
                          key={series[index].label}
                          className={classes.bar}
                          style={{
                            height: `${Math.max(0, value / max) * 100}%`,
                            backgroundColor: series[index].color,
                          }}
                        />
                      ))}
                    </button>
                  </Tooltip>
                );
              })}
            </Box>
          </Box>
          <Box className={classes.chartLabels} mt="xs">
            {data.map((point) => (
              <Text key={point.key} size="xs" c="dimmed">
                {point.label}
              </Text>
            ))}
          </Box>
        </Box>
      ) : (
        <Text c="dimmed" size="sm" py="xl" ta="center">
          {t('noTrendData')}
        </Text>
      )}
    </Stack>
  );
}
