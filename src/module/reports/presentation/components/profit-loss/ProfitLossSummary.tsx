import React from 'react';
import type { ProfitLossReport } from '@/module/reports/domain/profitLoss.types';
import { marginOf } from '@/module/reports/domain/profitLossRows';
import { displayDate, formatMoney } from '@/module/reports/domain/reportFormat';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';

import { useTranslation } from '@/i18n';

const percentFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

interface ProfitLossSummaryProps {
  report: ProfitLossReport;
}

/** Revenue and the three profit levels, each with its share of revenue. */
export const ProfitLossSummary: React.FC<ProfitLossSummaryProps> = ({ report }) => {
  const { t } = useTranslation('reports');
  const { summary } = report;
  const margin = (profit: number) => {
    const share = marginOf(profit, summary.netRevenue);
    return share === null
      ? undefined
      : t('profitLoss.margin', { percent: percentFormat.format(share) });
  };

  return (
    <ReportKpiStrip
      caption={t('profitLoss.cardPeriod')}
      period={`${displayDate(report.startDate)} — ${displayDate(report.endDate)}`}
      items={[
        {
          key: 'revenue',
          label: t('profitLoss.cardRevenue'),
          value: formatMoney(summary.netRevenue),
          hint:
            summary.totalContra === 0
              ? t('profitLoss.cardRevenueHint')
              : t('profitLoss.cardRevenueContraHint', {
                  gross: formatMoney(summary.grossRevenue),
                  contra: formatMoney(summary.totalContra),
                }),
        },
        {
          key: 'gross',
          label: t('profitLoss.cardGross'),
          value: formatMoney(summary.grossProfit),
          hint: margin(summary.grossProfit),
        },
        {
          key: 'operating',
          label: t('profitLoss.cardOperating'),
          value: formatMoney(summary.profitAfterOpex),
          hint: margin(summary.profitAfterOpex),
        },
        {
          key: 'afterTax',
          label: t('profitLoss.cardAfterTax'),
          value: formatMoney(summary.profitAfterTax),
          hint: margin(summary.profitAfterTax),
        },
      ]}
    />
  );
};
