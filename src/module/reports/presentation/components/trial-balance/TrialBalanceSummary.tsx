import React from 'react';
import { displayDate, formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import { isTrialBalanceBalanced } from '@/module/reports/domain/trialBalance';
import type { TrialBalanceReport } from '@/module/reports/domain/trialBalance.types';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { ReportStatus } from '@/module/reports/presentation/components/shared/ReportStatus';
import { useTranslation } from '@/i18n';

interface TrialBalanceSummaryProps {
  report: TrialBalanceReport;
}

/** Whether the closing balances match, the closing totals, the profit and the account count. */
export const TrialBalanceSummary: React.FC<TrialBalanceSummaryProps> = ({ report }) => {
  const { t } = useTranslation('reports');
  const balanced = isTrialBalanceBalanced(report);

  return (
    <ReportKpiStrip
      caption={t('trialBalance.cardPeriod')}
      period={`${displayDate(report.startDate)} — ${displayDate(report.endDate)}`}
      status={
        <ReportStatus
          tone={balanced ? 'ok' : 'warn'}
          label={balanced ? t('trialBalance.statusBalanced') : t('trialBalance.statusUnbalanced')}
          tooltip={
            balanced ? t('trialBalance.statusBalancedHint') : t('trialBalance.statusUnbalancedHint')
          }
        />
      }
      items={[
        {
          key: 'closingDebit',
          label: t('trialBalance.cardClosingDebit'),
          value: formatMoney(report.totals.closing.debit),
        },
        {
          key: 'closingCredit',
          label: t('trialBalance.cardClosingCredit'),
          value: formatMoney(report.totals.closing.credit),
        },
        {
          key: 'profit',
          label: t('trialBalance.cardProfit'),
          value: formatMoney(report.profit),
          hint: t('trialBalance.cardProfitHint'),
        },
        {
          key: 'accounts',
          label: t('trialBalance.cardAccounts'),
          value: formatCount(report.pagination.totalRows),
          hint: t('trialBalance.cardAccountsHint'),
        },
      ]}
    />
  );
};
