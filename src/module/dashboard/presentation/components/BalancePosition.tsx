import { Badge, Box, Group, Progress, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatIDR } from './dashboardFormat';
import classes from './dashboard.module.css';

type BalancePositionProps = {
  hasData: boolean;
  loading: boolean;
  isBalanced: boolean;
  assets: number;
  liabilities: number;
  equity: number;
  liabilityRatio: number;
  equityRatio: number;
  workingCapital: number;
};

export function BalancePosition({
  hasData,
  loading,
  isBalanced,
  assets,
  liabilities,
  equity,
  liabilityRatio,
  equityRatio,
  workingCapital,
}: Readonly<BalancePositionProps>) {
  const { t } = useTranslation('dashboard');
  if (loading) return <Skeleton h={240} radius="md" />;
  if (!hasData) {
    return (
      <Text c="dimmed" size="sm">
        {t('balanceUnavailable')}
      </Text>
    );
  }
  const canShowShares = isBalanced && assets > 0 && liabilities >= 0 && equity >= 0;

  return (
    <Stack gap="lg">
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {t('equationTitle')}
        </Text>
        <Badge variant="light" color={isBalanced ? 'gray' : 'orange'}>
          {t(isBalanced ? 'equationBalanced' : 'equationUnbalanced')}
        </Badge>
      </Group>
      <Box className={classes.equation}>
        {[
          { label: t('totalAssets'), value: assets, operator: '=' },
          { label: t('totalLiabilities'), value: liabilities, operator: '+' },
          { label: t('totalEquity'), value: equity, operator: '' },
        ].map((item) => (
          <Box key={item.label} className={classes.equationItem}>
            <Text size="xs" c="dimmed">
              {item.label}
            </Text>
            <Text size="lg" fw={700} className={classes.numeric}>
              {formatIDR(item.value)}
            </Text>
            {item.operator && (
              <span className={classes.equationOperator} aria-hidden="true">
                {item.operator}
              </span>
            )}
          </Box>
        ))}
      </Box>
      {canShowShares && (
        <Stack gap="xs">
          <Text size="xs" c="dimmed">
            {t('fundingLabel')}
          </Text>
          <Progress.Root size={12} radius="sm" aria-label={t('fundingLabel')}>
            <Progress.Section
              value={liabilityRatio}
              color="primary.3"
              aria-label={t('totalLiabilities')}
            />
            <Progress.Section value={equityRatio} color="primary.6" aria-label={t('totalEquity')} />
          </Progress.Root>
          <Group justify="space-between" gap="xs">
            <Text size="xs" c="dimmed">
              {t('totalLiabilities')} {liabilityRatio.toFixed(1)}%
            </Text>
            <Text size="xs" c="primary">
              {t('totalEquity')} {equityRatio.toFixed(1)}%
            </Text>
          </Group>
        </Stack>
      )}
      <Group justify="space-between" className={classes.summaryDivider}>
        <Box>
          <Text size="sm" fw={600}>
            {t('netWorkingCapital')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('insightWorkingCapitalDesc')}
          </Text>
        </Box>
        <Text fw={700} c={workingCapital < 0 ? 'red.7' : 'primary'} className={classes.numeric}>
          {formatIDR(workingCapital)}
        </Text>
      </Group>
    </Stack>
  );
}
