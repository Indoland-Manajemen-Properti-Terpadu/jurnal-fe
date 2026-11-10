import React from 'react';
import { IconLock } from '@tabler/icons-react';
import type {
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { displayDate, formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { ReportStatus } from '@/module/reports/presentation/components/shared/ReportStatus';
import { useTranslation } from '@/i18n';

interface GeneralLedgerSummaryCardsProps {
  report: GeneralLedgerReport;
  period: ReportPeriod;
  isBalanced: boolean;
}

/**
 * Four cards of one shape (a name, a figure, a line of what it is): the accounts, the debit and
 * the credit of the whole ledger, and their difference. No card carries a chart the others lack.
 */
export const GeneralLedgerSummaryCards: React.FC<GeneralLedgerSummaryCardsProps> = ({
  report,
  period,
  isBalanced,
}) => {
  const { t } = useTranslation('reports');
  const { periodDebitTotal: debit, periodCreditTotal: credit } = report;

  return (
    <ReportKpiStrip
      caption={t('generalLedger.summaryTitle')}
      period={`${displayDate(period.startDate)} — ${displayDate(period.endDate)}`}
      status={
        <>
          {report.periodLockType && (
            <ReportStatus
              tone="neutral"
              icon={<IconLock size={13} color="var(--mantine-color-gray-6)" />}
              label={`${report.periodLockName ? `${report.periodLockName} · ` : ''}${report.periodLockType}`}
            />
          )}
          {!isBalanced && (
            <ReportStatus
              tone="warn"
              label={t('generalLedger.badgeUnbalanced')}
              tooltip={t('generalLedger.unbalancedNote')}
            />
          )}
        </>
      }
      items={[
        {
          key: 'accounts',
          label: t('generalLedger.cardAccounts'),
          value: formatCount(report.pagination.totalAccounts),
          hint: t('generalLedger.cardAccountsHint'),
        },
        {
          key: 'debit',
          label: t('generalLedger.cardTotalDebit'),
          value: formatMoney(debit),
          hint: t('generalLedger.cardTotalDebitHint'),
        },
        {
          key: 'credit',
          label: t('generalLedger.cardTotalCredit'),
          value: formatMoney(credit),
          hint: t('generalLedger.cardTotalCreditHint'),
        },
        {
          key: 'difference',
          label: t('generalLedger.cardDifference'),
          value: formatMoney(Math.abs(debit - credit)),
          hint: t('generalLedger.cardDifferenceHint'),
        },
      ]}
    />
  );
};
