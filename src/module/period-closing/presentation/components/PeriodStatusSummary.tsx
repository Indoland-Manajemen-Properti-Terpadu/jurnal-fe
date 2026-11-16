import { Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { addDays } from '@/module/period-closing/domain/periodRules';
import { formatDay } from '@/module/period-closing/presentation/periodFormat';
import { BooksTimeline } from './BooksTimeline';
import { PeriodIllustration, type PeriodIllustrationName } from './PeriodIllustration';
import classes from './PeriodStatusSummary.module.css';

interface PeriodStatusSummaryProps {
  latestClosing: AccountingPeriod | undefined;
  activeLocks: AccountingPeriod[];
  loading: boolean;
}

interface FactProps {
  art: PeriodIllustrationName;
  label: string;
  value: string;
  hint: string;
  loading: boolean;
}

function Fact({ art, label, value, hint, loading }: Readonly<FactProps>) {
  return (
    <div className={classes.fact}>
      <div className={classes.art}>
        <PeriodIllustration name={art} maxWidth={84} />
      </div>
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
    </div>
  );
}

/** Where the books stand today: the strip first, then closed through when, what is locked, and what is open. */
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
    <Paper withBorder radius="md" p="xl" bg="white">
      <Stack gap="lg">
        <Stack gap={2}>
          <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
            {t('timeline.title')}
          </Text>
          <Text fz="sm" c="dimmed">
            {t('timeline.subtitle')}
          </Text>
        </Stack>

        {loading ? (
          <Skeleton height={44} radius="md" />
        ) : (
          <BooksTimeline
            closedThrough={latestClosing?.endDate}
            lockedThrough={latestLockEnd || undefined}
          />
        )}

        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={0} className={classes.grid}>
          <Fact
            art="closed"
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
            art="locked"
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
            art="open"
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
      </Stack>
    </Paper>
  );
}
