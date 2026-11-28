import { Box, Paper, Text } from '@mantine/core';
import type {
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { displayLedgerDate, periodDifference } from '@/module/reports/domain/generalLedgerView';
import { formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import { useReportPrecision } from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from './GeneralLedger.module.css';

interface Props {
  report: GeneralLedgerReport;
  period: ReportPeriod;
  activeAccountCount: number;
  journalCount: number;
  isBalanced: boolean;
}

export function GeneralLedgerSummaryCards({
  report,
  period,
  activeAccountCount,
  journalCount,
  isBalanced,
}: Props) {
  const { t, currentLanguage } = useTranslation('reports');
  const precision = useReportPrecision();
  const difference = periodDifference(report.periodDebitTotal, report.periodCreditTotal);
  const periodText = `${displayLedgerDate(period.startDate, currentLanguage)} ${t('generalLedger.until')} ${displayLedgerDate(period.endDate, currentLanguage)}`;
  return (
    <Paper withBorder radius="lg" p={0} bg="white">
      <div className={classes.summaryGrid}>
        <Box className={classes.metric}>
          <Text fz="sm" c="dimmed">
            {t('generalLedger.cardAccounts')}
          </Text>
          <Text fz="xl" fw={700} className={classes.numeric}>
            {t('generalLedger.accountCount', { count: formatCount(activeAccountCount) })}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('generalLedger.accountCountHint', {
              count: formatCount(report.pagination.totalAccounts),
            })}
          </Text>
        </Box>
        <Box className={classes.metric}>
          <Text fz="sm" c="dimmed">
            {t('generalLedger.cardTotalDebit')}
          </Text>
          <Text fz="xl" fw={700} className={classes.numeric}>
            {formatMoney(report.periodDebitTotal, precision)}
          </Text>
          <Text fz="xs" c="dimmed">
            {journalCount
              ? t('generalLedger.debitHint', {
                  count: formatCount(journalCount),
                  period: periodText,
                })
              : t('generalLedger.noJournals')}
          </Text>
        </Box>
        <Box className={classes.metric}>
          <Text fz="sm" c="dimmed">
            {t('generalLedger.cardTotalCredit')}
          </Text>
          <Text fz="xl" fw={700} className={classes.numeric}>
            {formatMoney(report.periodCreditTotal, precision)}
          </Text>
          <Text fz="xs" c="dimmed">
            {periodText}
          </Text>
        </Box>
        <Box className={classes.metric}>
          <Text fz="sm" c="dimmed">
            {t('generalLedger.balanceTitle')}
          </Text>
          <Text fz="xl" fw={700} c={isBalanced ? 'green.7' : 'red.7'} className={classes.numeric}>
            {isBalanced
              ? t('generalLedger.balanced')
              : t('generalLedger.differenceValue', {
                  value: formatMoney(difference, precision),
                })}
          </Text>
          <Text fz="xs" c="dimmed">
            {isBalanced ? t('generalLedger.balanceHint') : t('generalLedger.unbalancedTitle')}
          </Text>
        </Box>
      </div>
    </Paper>
  );
}
