import { Box, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import classes from './ContactStatsGrid.module.css';

type ContactStatsProps = {
  counts: number[];
  isLoading: boolean;
  isError: boolean;
};

export function ContactStatsGrid({ counts, isLoading, isError }: Readonly<ContactStatsProps>) {
  const { t } = useTranslation('contacts');
  const [total = 0, customers = 0, suppliers = 0, employees = 0, units = 0, others = 0] = counts;
  const types = [
    { key: 'customers', count: customers },
    { key: 'suppliers', count: suppliers },
    { key: 'employees', count: employees },
    { key: 'units', count: units },
    { key: 'others', count: others },
  ] as const;
  const assigned = types.reduce((sum, type) => sum + type.count, 0);
  const scale = Math.max(total, assigned);
  const unclassified = Math.max(0, total - assigned);
  const formatted = (value: number) => value.toLocaleString('id-ID');
  const formattedPercent = (value: number) =>
    `${value.toLocaleString('id-ID', { maximumFractionDigits: 1, minimumFractionDigits: value > 0 && value < 1 ? 1 : 0 })}%`;

  return (
    <Paper
      component="section"
      withBorder
      radius="lg"
      p={{ base: 'md', sm: 'lg' }}
      shadow="none"
      className={classes.overview}
      aria-label={t('stats.heading')}
    >
      <Box className={classes.total}>
        <Text fz="xs" fw={700} c="dimmed" tt="uppercase" lts="0.06em">
          {t('stats.total')}
        </Text>
        {isLoading ? (
          <Skeleton height={38} width={120} mt="sm" />
        ) : (
          <Text className={classes.totalValue}>{isError ? '—' : formatted(total)}</Text>
        )}
        <Text fz="sm" c="dimmed">
          {isError ? t('stats.unavailable') : t('stats.totalHint')}
        </Text>
      </Box>

      <Stack gap="sm" className={classes.breakdown}>
        <Group justify="space-between" align="baseline" gap="xs">
          <Text fw={700} fz="sm">
            {t('stats.heading')}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('stats.shareHint')}
          </Text>
        </Group>
        {isLoading ? (
          <Skeleton height={24} radius="xl" />
        ) : (
          <div className={classes.bar} role="img" aria-label={t('stats.chartLabel')}>
            {!isError &&
              types.map(({ key, count }) =>
                count > 0 ? (
                  <div
                    key={key}
                    className={classes.segment}
                    data-type={key}
                    style={{ width: `${(count / scale) * 100}%` }}
                    title={`${t(`stats.${key}`)}: ${formatted(count)}`}
                  />
                ) : null
              )}
            {!isError && unclassified > 0 && (
              <div
                className={classes.unclassified}
                style={{ width: `${(unclassified / scale) * 100}%` }}
              />
            )}
          </div>
        )}
        <div className={classes.legend}>
          {types.map(({ key, count }) => {
            const percent = total > 0 ? (count / total) * 100 : 0;
            return (
              <Box key={key} className={classes.legendItem}>
                <span className={classes.dot} data-type={key} aria-hidden="true" />
                <Text fz="sm" className={classes.typeLabel}>
                  {t(`stats.${key}`)}
                </Text>
                {isLoading ? (
                  <Skeleton height={18} width={72} />
                ) : (
                  <Text fz="sm" fw={700} className={classes.count}>
                    {isError ? '—' : formatted(count)}
                    <Text span c="dimmed" fw={500} fz="xs" ml={6}>
                      {isError ? '' : formattedPercent(percent)}
                    </Text>
                  </Text>
                )}
              </Box>
            );
          })}
          {unclassified > 0 && !isLoading && !isError && (
            <Box className={classes.legendItem}>
              <span className={classes.unclassifiedDot} aria-hidden="true" />
              <Text fz="sm">{t('stats.unclassified')}</Text>
              <Text fz="sm" fw={700} className={classes.count}>
                {formatted(unclassified)}
              </Text>
            </Box>
          )}
        </div>
        <Text fz="xs" c="dimmed">
          {assigned > total ? t('stats.normalizedHint') : t('stats.multiTypeHint')}
        </Text>
      </Stack>
    </Paper>
  );
}

export default ContactStatsGrid;
