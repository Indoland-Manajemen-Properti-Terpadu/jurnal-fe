import React from 'react';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import { matchRate } from '@/module/reports/domain/balanceSheetInsights';
import { displayDate, formatMoney, percentOf } from '@/module/reports/domain/reportFormat';
import { ReportDonut } from '@/module/reports/presentation/components/shared/ReportDonut';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { ReportRing } from '@/module/reports/presentation/components/shared/ReportRing';
import { ReportStatus } from '@/module/reports/presentation/components/shared/ReportStatus';

import { useTranslation } from '@/i18n';

const STRONG = 'var(--mantine-color-primary-6)';
const MEDIUM = 'var(--mantine-color-primary-3)';
const SOFT = 'var(--mantine-color-primary-2)';

interface BalanceSheetSummaryCardsProps {
  data: BalanceSheetData;
}

export const BalanceSheetSummaryCards: React.FC<BalanceSheetSummaryCardsProps> = ({ data }) => {
  const { t } = useTranslation('reports');
  const difference = formatMoney(Math.abs(data.discrepancy));
  const match = matchRate(data.totalAssets, data.totalLiabilitiesAndEquity);
  const funding = data.totalLiabilities + data.totalEquity;

  return (
    <ReportKpiStrip
      caption={t('balanceSheet.cardPosition')}
      period={displayDate(data.endDate)}
      status={
        !data.isBalanced && (
          <ReportStatus
            tone="warn"
            label={t('balanceSheet.unbalanced', { amount: difference })}
            tooltip={difference}
          />
        )
      }
      items={[
        {
          key: 'assets',
          label: t('balanceSheet.cardTotalAssets'),
          value: formatMoney(data.totalAssets),
          hint: t('balanceSheet.cardAssetsHint'),
          visual: (
            <ReportDonut
              description={t('balanceSheet.cardTotalAssets')}
              segments={[
                { value: data.assets.totalCurrentAssets, tone: STRONG },
                { value: data.assets.totalNonCurrentAssets, tone: MEDIUM },
              ]}
            />
          ),
        },
        {
          key: 'liabilities',
          label: t('balanceSheet.cardTotalLiabilities'),
          value: formatMoney(data.totalLiabilities),
          hint: t('balanceSheet.cardLiabilitiesHint'),
          visual: (
            <ReportDonut
              description={t('balanceSheet.cardTotalLiabilities')}
              label={`${Math.round(percentOf(data.totalLiabilities, funding))}%`}
              segments={[
                { value: data.liabilities.totalCurrentLiabilities, tone: STRONG },
                { value: data.liabilities.totalNonCurrentLiabilities, tone: SOFT },
              ]}
            />
          ),
        },
        {
          key: 'equity',
          label: t('balanceSheet.cardTotalEquity'),
          value: formatMoney(data.totalEquity),
          hint: t('balanceSheet.cardEquityHint'),
          visual: (
            <ReportDonut
              description={t('balanceSheet.cardTotalEquity')}
              label={`${Math.round(percentOf(data.totalEquity, funding))}%`}
              segments={[{ value: Math.max(0, data.totalEquity), tone: STRONG }]}
            />
          ),
        },
        {
          key: 'liabilitiesEquity',
          label: t('balanceSheet.cardLiabilitiesEquity'),
          value: formatMoney(data.totalLiabilitiesAndEquity),
          hint: t('balanceSheet.cardMustEqual'),
          visual: (
            <ReportRing
              value={match}
              label={`${Math.round(match)}%`}
              tone={data.isBalanced ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-red-6)'}
            />
          ),
        },
      ]}
    />
  );
};
