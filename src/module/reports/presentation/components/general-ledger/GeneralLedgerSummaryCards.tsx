import React, { useMemo } from 'react';
import { IconLock } from '@tabler/icons-react';
import type {
  GeneralLedgerReport,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import {
  groupAccountsMovement,
  percentOf,
  pickGranularity,
} from '@/module/reports/domain/generalLedgerInsights';
import { displayDate, formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { ReportDotMatrix } from '@/module/reports/presentation/components/shared/ReportDotMatrix';
import { ReportMiniBars } from '@/module/reports/presentation/components/shared/ReportMiniBars';
import { ReportRing } from '@/module/reports/presentation/components/shared/ReportRing';
import { ReportStatus } from '@/module/reports/presentation/components/shared/ReportStatus';
import { useTranslation } from '@/i18n';
import { DebitCreditBars } from './DebitCreditBars';

interface GeneralLedgerSummaryCardsProps {
  report: GeneralLedgerReport;
  period: ReportPeriod;
  isBalanced: boolean;
}

export const GeneralLedgerSummaryCards: React.FC<GeneralLedgerSummaryCardsProps> = ({
  report,
  period,
  isBalanced,
}) => {
  const { t } = useTranslation('reports');
  const { periodDebitTotal: debit, periodCreditTotal: credit } = report;
  const daily = useMemo(
    () => groupAccountsMovement(report.accounts, pickGranularity(period.startDate, period.endDate)),
    [report.accounts, period.startDate, period.endDate]
  );
  const withMovement = report.accounts.filter((account) => account.transactions.length > 0).length;
  const matchRate =
    debit === credit ? 100 : percentOf(Math.min(debit, credit), Math.max(debit, credit));

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
          visual: (
            <ReportDotMatrix
              active={withMovement}
              total={report.accounts.length}
              label={t('generalLedger.visualAccounts', {
                active: withMovement,
                total: report.accounts.length,
              })}
            />
          ),
        },
        {
          key: 'debit',
          label: t('generalLedger.cardTotalDebit'),
          value: formatMoney(debit),
          hint: t('generalLedger.cardTotalDebitHint'),
          visual: (
            <ReportMiniBars
              values={daily.map((bucket) => bucket.debit)}
              label={t('generalLedger.visualDebit')}
            />
          ),
        },
        {
          key: 'credit',
          label: t('generalLedger.cardTotalCredit'),
          value: formatMoney(credit),
          hint: t('generalLedger.cardTotalCreditHint'),
          visual: (
            <ReportMiniBars
              values={daily.map((bucket) => bucket.credit)}
              tone="var(--mantine-color-primary-3)"
              label={t('generalLedger.visualCredit')}
            />
          ),
        },
        {
          key: 'difference',
          label: t('generalLedger.cardDifference'),
          value: formatMoney(Math.abs(debit - credit)),
          hint: t('generalLedger.cardDifferenceHint'),
          visual: (
            <ReportRing
              value={matchRate}
              label={`${Math.round(matchRate)}%`}
              tone={isBalanced ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-red-6)'}
            />
          ),
        },
      ]}
      footer={{
        title: t('generalLedger.compareTitle'),
        content: <DebitCreditBars debit={debit} credit={credit} />,
      }}
    />
  );
};
