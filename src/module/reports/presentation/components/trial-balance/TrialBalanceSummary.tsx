import React from 'react';
import { displayDate, formatMoney, percentOf } from '@/module/reports/domain/reportFormat';
import type {
  TrialBalanceReport,
  TrialBalanceSums,
} from '@/module/reports/domain/trialBalance.types';
import { ReportSummaryCard } from '@/module/reports/presentation/components/shared/ReportSummaryCard';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { useTranslation } from '@/i18n';

/** A difference under a cent is rounding, not a real gap. */
const TOLERANCE = 0.005;

const DEBIT_TONE = 'var(--mantine-color-primary-6)';
const CREDIT_TONE = 'var(--mantine-color-primary-3)';

interface SummaryCardProps {
  title: string;
  caption: string;
  sums: TrialBalanceSums;
  /** The closing line: what it is called and its figure; `alert` draws it red. */
  result: { label: string; value: number; alert: boolean };
}

/** A card of the shared anatomy: debit and credit on one scale, then one closing line. */
const SummaryCard: React.FC<SummaryCardProps> = ({ title, caption, sums, result }) => {
  const { t } = useTranslation('reports');
  const peak = Math.max(sums.debit, sums.credit);

  return (
    <ReportSummaryCard
      title={title}
      caption={caption}
      ariaLabel={t('trialBalance.cardAria', {
        group: title,
        debit: formatMoney(sums.debit),
        credit: formatMoney(sums.credit),
      })}
      lines={[
        {
          key: 'debit',
          label: t('trialBalance.colDebit'),
          value: sums.debit,
          share: percentOf(sums.debit, peak),
          tone: DEBIT_TONE,
        },
        {
          key: 'credit',
          label: t('trialBalance.colCredit'),
          value: sums.credit,
          share: percentOf(sums.credit, peak),
          tone: CREDIT_TONE,
        },
      ]}
      closing={result}
    />
  );
};

interface TrialBalanceSummaryProps {
  report: TrialBalanceReport;
}

/**
 * Four cards that mirror the first four column groups of the table, in the same order and with
 * the same names: opening balance, movement, closing balance and profit and loss. The first three
 * end with the difference between debit and credit (red only when there is one); profit and
 * loss ends with the profit, which is revenue (credit) less expenses (debit).
 */
export const TrialBalanceSummary: React.FC<TrialBalanceSummaryProps> = ({ report }) => {
  const { t } = useTranslation('reports');
  const { opening, movement, closing, profitLoss } = report.totals;
  const difference = (sums: TrialBalanceSums) => {
    const gap = Math.abs(sums.debit - sums.credit);
    return {
      label: t('trialBalance.cardDifference'),
      value: gap < TOLERANCE ? 0 : gap,
      alert: gap >= TOLERANCE,
    };
  };

  return (
    <ReportKpiStrip
      caption={t('trialBalance.cardPeriod')}
      period={`${displayDate(report.startDate)} — ${displayDate(report.endDate)}`}
      items={[
        {
          key: 'opening',
          label: t('trialBalance.groupOpening'),
          content: (
            <SummaryCard
              title={t('trialBalance.groupOpening')}
              caption={t('trialBalance.captionOpening')}
              sums={opening}
              result={difference(opening)}
            />
          ),
        },
        {
          key: 'movement',
          label: t('trialBalance.groupMovement'),
          content: (
            <SummaryCard
              title={t('trialBalance.groupMovement')}
              caption={t('trialBalance.captionMovement')}
              sums={movement}
              result={difference(movement)}
            />
          ),
        },
        {
          key: 'closing',
          label: t('trialBalance.groupClosing'),
          content: (
            <SummaryCard
              title={t('trialBalance.groupClosing')}
              caption={t('trialBalance.captionClosing')}
              sums={closing}
              result={difference(closing)}
            />
          ),
        },
        {
          key: 'profitLoss',
          label: t('trialBalance.groupProfitLoss'),
          content: (
            <SummaryCard
              title={t('trialBalance.groupProfitLoss')}
              caption={t('trialBalance.captionProfitLoss')}
              sums={profitLoss}
              result={{
                label: t('trialBalance.cardProfit'),
                value: report.profit,
                alert: report.profit < 0,
              }}
            />
          ),
        },
      ]}
    />
  );
};
