import { Paper, Skeleton, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/formatCurrency';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { summarizeBankCashAccounts } from '@/module/bank-cash/domain/bankCashSummary';
import { useTranslation } from '@/i18n';
import classes from '@/module/bank-cash/presentation/components/stats/StatsBankCashGrid.module.css';

export type StatsBankCashGridProps = {
  accounts: JournalAccounts[];
  loading?: boolean;
};

/** Today's calendar date in the books' time zone (WIB), written for the reader's language. */
const todayLabel = (language: string): string =>
  new Intl.DateTimeFormat(language === 'en' ? 'en-GB' : 'id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Asia/Jakarta',
  }).format(new Date());

export default function StatsBankCashGrid({ accounts, loading }: StatsBankCashGridProps) {
  const { t, currentLanguage } = useTranslation('bankCash');
  const summary = summarizeBankCashAccounts(accounts);

  if (loading) {
    return (
      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }}>
        <Skeleton height={12} width={150} mb="md" />
        <Skeleton height={42} width={260} mb="sm" />
        <Skeleton height={10} width={200} />
      </Paper>
    );
  }

  return (
    <Paper className={classes.summary} withBorder radius="lg">
      <div className={classes.primaryMetric} style={{ borderRight: 0 }}>
        <Text fz="sm" c="dimmed" fw={600}>
          {t('list.balanceTitle')}
        </Text>
        <Text className={classes.value}>{formatCurrency(summary.total)}</Text>
        <Text fz="xs" c="dimmed" mt={8}>
          {t('list.accountCount', { count: summary.accountCount })} ·{' '}
          {t('list.asOf', { date: todayLabel(currentLanguage) })}
        </Text>
      </div>
    </Paper>
  );
}
