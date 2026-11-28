import React from 'react';
import { Box, Paper, Stack, Text } from '@mantine/core';
import type { ProfitLossReport } from '@/module/reports/domain/profitLoss.types';
import { marginOf } from '@/module/reports/domain/profitLossRows';
import { colorRoles } from '@/theme';
import { useTranslation } from '@/i18n';
import { useReportNegativeFormat } from '@/module/reports/presentation/hooks/useReportPrecision';
import classes from './ProfitLossSummaryPanel.module.css';

interface ProfitLossSummaryPanelProps {
  report: ProfitLossReport;
}

const compactCurrency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});
const formatCompactMoney = (value: number, negativeFormat: 'minus' | 'parentheses') => {
  const formatted = compactCurrency.format(Math.abs(value));
  return value < 0 ? (negativeFormat === 'minus' ? `-${formatted}` : `(${formatted})`) : formatted;
};

const formatPercent = (
  value: number | null,
  language: string,
  negativeFormat: 'minus' | 'parentheses'
) => {
  if (value === null) return '–';
  const formatter = new Intl.NumberFormat(language === 'id' ? 'id-ID' : 'en-US', {
    maximumFractionDigits: 1,
  });
  const formatted = `${formatter.format(Math.abs(value))}%`;
  return value < 0 ? (negativeFormat === 'minus' ? `-${formatted}` : `(${formatted})`) : formatted;
};

export const ProfitLossSummaryPanel: React.FC<ProfitLossSummaryPanelProps> = ({ report }) => {
  const { t, currentLanguage } = useTranslation('reports');
  const negativeFormat = useReportNegativeFormat();
  const { summary } = report;
  const comparison = report.statement?.compare;
  const revenue = summary.netRevenue;
  const income = revenue + summary.totalOtherIncome;
  const expenses = summary.totalOpex + summary.totalOtherExpense;
  const comparisonTotals = comparison?.totals;
  const comparedValues = comparisonTotals
    ? [
        comparisonTotals.pendapatan + comparisonTotals.lain_masuk,
        comparisonTotals.laba_kotor,
        comparisonTotals.beban + comparisonTotals.lain_keluar,
        comparisonTotals.laba_bersih,
      ]
    : null;

  const cards = [
    {
      key: 'revenue',
      label: t('profitLoss.summaryRevenue'),
      value: income,
      rows: [
        [t('profitLoss.summaryOperatingRevenue'), summary.totalRevenue],
        [t('profitLoss.summaryOtherIncome'), summary.totalOtherIncome],
      ] as const,
    },
    {
      key: 'gross',
      label: t('profitLoss.summaryGrossProfit'),
      value: summary.grossProfit,
      rows: [
        [t('profitLoss.summaryOperatingRevenue'), revenue],
        [t('profitLoss.summaryDirectCost'), summary.totalDirectCost],
      ] as const,
    },
    {
      key: 'expenses',
      label: t('profitLoss.summaryExpenses'),
      value: expenses,
      rows: [
        [t('profitLoss.summaryOperatingExpenses'), summary.totalOpex],
        [t('profitLoss.summaryOtherExpenses'), summary.totalOtherExpense],
      ] as const,
    },
    {
      key: 'net',
      label: t('profitLoss.summaryNetProfit'),
      value: summary.profitAfterTax,
      rows: [
        [t('profitLoss.summaryBeforeTax'), summary.profitNett],
        [t('profitLoss.summaryIncomeTax'), summary.totalTaxes],
      ] as const,
    },
  ];

  const indicators = [
    {
      key: 'grossMargin',
      label: t('profitLoss.grossMargin'),
      value: marginOf(summary.grossProfit, revenue),
      hint: t('profitLoss.grossMarginHint'),
    },
    {
      key: 'netMargin',
      label: t('profitLoss.netMargin'),
      value: marginOf(summary.profitAfterTax, revenue),
      hint:
        summary.profitAfterTax < 0
          ? t('profitLoss.netMarginLoss')
          : t('profitLoss.netMarginProfit'),
    },
    {
      key: 'expenseRatio',
      label: t('profitLoss.expenseRatio'),
      value: marginOf(summary.totalOpex, revenue),
      hint: t('profitLoss.expenseRatioHint'),
    },
  ];

  return (
    <Stack gap="md">
      <Paper withBorder radius="lg" p={0} className={classes.summaryFrame}>
        <Box className={classes.summaryGrid}>
          {cards.map((card, index) => {
            const comparedValue = comparedValues?.[index];
            return (
              <Box key={card.key} className={classes.metric}>
                <Text fz="sm" c="dimmed">
                  {card.label}
                </Text>
                <Text
                  fz="xl"
                  fw={700}
                  c={card.value < 0 ? colorRoles.dangerStrong : 'dark.9'}
                  mt={2}
                  className={classes.number}
                >
                  {formatCompactMoney(card.value, negativeFormat)}
                </Text>
                {comparedValue !== undefined && (
                  <Text fz="xs" c="dimmed" mt={2}>
                    {t('profitLoss.comparedValue', {
                      period: comparison?.label ?? '',
                      value: formatCompactMoney(comparedValue, negativeFormat),
                    })}
                  </Text>
                )}
                <Stack gap={4} mt="md" className={classes.breakdown}>
                  {card.rows.map(([label, value]) => (
                    <Box key={label} className={classes.breakdownRow}>
                      <Text fz="xs" c="dimmed">
                        {label}
                      </Text>
                      <Text
                        fz="xs"
                        c={value < 0 ? colorRoles.dangerStrong : 'dark.7'}
                        className={classes.number}
                      >
                        {value === 0 ? '–' : formatCompactMoney(value, negativeFormat)}
                      </Text>
                    </Box>
                  ))}
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Paper>

      <Paper withBorder radius="lg" p={0} className={classes.indicatorFrame}>
        <Box className={classes.indicatorGrid}>
          {indicators.map((indicator) => (
            <Box key={indicator.key} className={classes.indicator}>
              <Text fz="sm" c="dimmed">
                {indicator.label}
              </Text>
              <Text
                fz="xl"
                fw={700}
                c={
                  indicator.value !== null && indicator.value < 0
                    ? colorRoles.dangerStrong
                    : 'dark.9'
                }
                mt={2}
                className={classes.number}
              >
                {formatPercent(indicator.value, currentLanguage, negativeFormat)}
              </Text>
              <Text fz="xs" c="dimmed" mt="sm">
                {indicator.hint}
              </Text>
            </Box>
          ))}
        </Box>
      </Paper>
    </Stack>
  );
};
