import type { ReactNode } from 'react';
import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBook2, IconCalendarCheck, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { addDays } from '@/module/period-closing/domain/periodRules';
import { formatDay } from '@/module/period-closing/presentation/periodFormat';
import classes from './PeriodStatusSummary.module.css';

interface PeriodStatusSummaryProps {
  latestClosing: AccountingPeriod | undefined;
  activeLocks: AccountingPeriod[];
  loading: boolean;
}

interface FactProps {
  icon: ReactNode;
  color: string;
  label: string;
  value: string;
  hint: string;
  loading: boolean;
}

function Fact({ icon, color, label, value, hint, loading }: Readonly<FactProps>) {
  return (
    <Group gap="sm" wrap="nowrap" align="flex-start" className={classes.fact}>
      <ThemeIcon size={36} radius="md" variant="light" color={color}>
        {icon}
      </ThemeIcon>
      <Stack gap={2} miw={0}>
        <Text size="xs" c="dimmed" fw={600}>
          {label}
        </Text>
        {loading ? (
          <Skeleton height={22} width={140} radius="sm" />
        ) : (
          <Text fw={700} fz="lg" lh={1.3}>
            {value}
          </Text>
        )}
        {loading ? (
          <Skeleton height={12} width={200} radius="sm" mt={4} />
        ) : (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
    </Group>
  );
}

/** Where the books stand today: closed through when, what is locked, and from when they are open. */
export function PeriodStatusSummary({
  latestClosing,
  activeLocks,
  loading,
}: Readonly<PeriodStatusSummaryProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const latestLockEnd = activeLocks.reduce<string>(
    (latest, period) => (period.endDate > latest ? period.endDate : latest),
    ''
  );

  return (
    <Paper withBorder radius="lg" p="md" bg="white">
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={0} className={classes.grid}>
        <Fact
          icon={<IconBook2 size={20} />}
          color="primary"
          label={t('summary.closedLabel')}
          value={
            latestClosing
              ? formatDay(latestClosing.endDate, currentLanguage)
              : t('summary.closedNone')
          }
          hint={latestClosing ? t('summary.closedHint') : t('summary.closedNoneHint')}
          loading={loading}
        />
        <Fact
          icon={<IconLock size={20} />}
          color="orange"
          label={t('summary.lockLabel')}
          value={
            activeLocks.length > 0
              ? t('summary.lockCount', { count: activeLocks.length })
              : t('summary.lockNone')
          }
          hint={
            latestLockEnd
              ? t('summary.lockHint', { date: formatDay(latestLockEnd, currentLanguage) })
              : t('summary.lockNoneHint')
          }
          loading={loading}
        />
        <Fact
          icon={<IconCalendarCheck size={20} />}
          color="teal"
          label={t('summary.openLabel')}
          value={
            latestClosing
              ? formatDay(addDays(latestClosing.endDate, 1), currentLanguage)
              : t('summary.openAll')
          }
          hint={activeLocks.length > 0 ? t('summary.openHintLocked') : t('summary.openHint')}
          loading={loading}
        />
      </SimpleGrid>
    </Paper>
  );
}
