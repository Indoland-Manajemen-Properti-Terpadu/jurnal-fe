import React, { type ReactNode } from 'react';
import { Box, Group, Paper, Text } from '@mantine/core';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import { balanceSheetChange } from '@/module/reports/domain/balanceSheetView';
import { displayLongDate, formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import {
  useReportNegativeFormat,
  useReportPrecision,
} from '@/module/reports/presentation/hooks/useReportPrecision';
import { BalanceSheetReading } from './BalanceSheetReading';
import classes from './BalanceSheet.module.css';

const compactCurrency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const compactMoney = (
  value: number,
  precision: number,
  negativeFormat: 'minus' | 'parentheses'
) => {
  if (Math.abs(value) < 1_000_000) return formatMoney(value, precision, negativeFormat);
  const formatted = compactCurrency.format(Math.abs(value));
  if (value >= 0) return formatted;
  return negativeFormat === 'minus' ? `-${formatted}` : `(${formatted})`;
};

interface SummaryLine {
  key: string;
  label: string;
  value: number | null;
  emptyWhenZero?: boolean;
  danger?: boolean;
}

interface SummaryColumnProps {
  title: string;
  ariaLabel: string;
  headline: ReactNode;
  lines: SummaryLine[];
  change?: { text: string; negative: boolean };
}

const SummaryColumn: React.FC<SummaryColumnProps> = ({
  title,
  ariaLabel,
  headline,
  lines,
  change,
}) => {
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();

  return (
    <Box component="section" className={classes.summaryColumn} aria-label={ariaLabel}>
      <Text fz="sm" c="dimmed" fw={600}>
        {title}
      </Text>
      {headline}
      {change && (
        <Text fz="xs" fw={600} c={change.negative ? 'red.7' : 'teal.7'} mt={2}>
          {change.text}
        </Text>
      )}
      <Box className={classes.summaryRows}>
        {lines.map((line) => (
          <Group
            key={line.key}
            className={classes.summaryRow}
            justify="space-between"
            align="baseline"
            gap="xs"
            wrap="nowrap"
          >
            <Text fz="xs" c="dimmed" className={classes.summaryLabel}>
              {line.label}
            </Text>
            {line.value !== null && (
              <Text
                fz="sm"
                fw={600}
                className={
                  line.value < 0 || line.danger
                    ? `${classes.summaryAmount} ${classes.summaryNegative}`
                    : classes.summaryAmount
                }
              >
                {line.emptyWhenZero && line.value === 0
                  ? '–'
                  : compactMoney(line.value, precision, negativeFormat)}
              </Text>
            )}
          </Group>
        ))}
      </Box>
    </Box>
  );
};

interface BalanceSheetSummaryProps {
  data: BalanceSheetData;
}

/** Four headline columns: assets, liabilities, equity, and the equation between them. */
export const BalanceSheetSummary: React.FC<BalanceSheetSummaryProps> = ({ data }) => {
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();
  const { t, currentLanguage } = useTranslation('reports');
  const { assets, liabilities } = data;

  const amountLabel = (label: string, value: number) =>
    `${label}: ${formatMoney(value, precision, negativeFormat)}`;
  const balanceStatus = t(
    data.isBalanced ? 'balanceSheet.statusBalanced' : 'balanceSheet.statusUnbalanced'
  );
  const changeText = (current: number, previous: number | undefined) => {
    if (previous === undefined || !data.compare) return undefined;
    const change = balanceSheetChange(current, previous).amount;
    const amountText = compactMoney(Math.abs(change), precision, negativeFormat);
    return {
      text:
        change === 0
          ? t('balanceSheet.compareUnchanged', {
              date: displayLongDate(data.compare.endDate, currentLanguage),
            })
          : t(change > 0 ? 'balanceSheet.compareIncrease' : 'balanceSheet.compareDecrease', {
              amount: amountText,
              date: displayLongDate(data.compare.endDate, currentLanguage),
            }),
      negative: change < 0,
    };
  };
  const headline = (value: number, alert = false) => (
    <Text
      fz="xl"
      fw={700}
      mt={4}
      className={`${classes.summaryHeadline} ${alert ? classes.summaryNegative : ''}`}
    >
      {compactMoney(value, precision, negativeFormat)}
    </Text>
  );

  const assetLines: SummaryLine[] = [
    {
      key: 'current',
      label: t('balanceSheet.groupCurrentAssets'),
      value: assets.totalCurrentAssets,
    },
    {
      key: 'nonCurrent',
      label: t('balanceSheet.groupNonCurrentAssets'),
      value:
        assets.netNonCurrentAssets ??
        balanceSheetChange(assets.totalNonCurrentAssets, -assets.totalDepreciationAmortization)
          .amount,
    },
  ];

  const isSplit =
    liabilities.currentLiabilities.length > 0 || liabilities.nonCurrentLiabilities.length > 0;
  const liabilityLines: SummaryLine[] = isSplit
    ? [
        {
          key: 'short',
          label: t('balanceSheet.groupCurrentLiabilities'),
          value: liabilities.totalCurrentLiabilities,
          emptyWhenZero: true,
        },
        {
          key: 'long',
          label: t('balanceSheet.groupLongTermLiabilities'),
          value: liabilities.totalNonCurrentLiabilities,
          emptyWhenZero: true,
        },
      ]
    : [{ key: 'all', label: t('balanceSheet.lineLiabilities'), value: data.totalLiabilities }];

  const currentYearProfit =
    data.currentYearProfit ??
    data.equity.find((item) =>
      /laba tahun berjalan|current year (profit|earnings)/i.test(item.accountName)
    )?.balance ??
    data.equity.find((item) => item.derived)?.balance ??
    null;
  const modalAndRetained =
    currentYearProfit === null
      ? null
      : balanceSheetChange(data.totalEquity, currentYearProfit).amount;
  const equityLines: SummaryLine[] = [
    {
      key: 'capital-and-retained',
      label: t('balanceSheet.capitalAndRetained'),
      value: modalAndRetained,
    },
    {
      key: 'current-year-profit',
      label: t('balanceSheet.currentYearProfit'),
      value: currentYearProfit,
    },
  ];

  const equationLines: SummaryLine[] = [
    { key: 'assets', label: t('balanceSheet.lineAssets'), value: data.totalAssets },
    {
      key: 'liabilitiesEquity',
      label: t('balanceSheet.lineLiabilitiesEquity'),
      value: data.totalLiabilitiesAndEquity,
    },
    ...(!data.isBalanced
      ? [
          {
            key: 'difference',
            label: t('balanceSheet.difference'),
            value: Math.abs(data.discrepancy),
            danger: true,
          },
        ]
      : []),
    {
      key: 'journal-count',
      label:
        data.journalCount == null
          ? t('balanceSheet.journalCountUnavailable')
          : t('balanceSheet.journalsThrough', {
              count: formatCount(data.journalCount),
              date: displayLongDate(data.endDate, currentLanguage),
            }),
      value: null,
    },
  ];

  return (
    <Box>
      <Paper withBorder radius="lg" p={0} bg="white">
        <div className={classes.summaryGrid}>
          <SummaryColumn
            title={t('balanceSheet.closeAssets')}
            ariaLabel={amountLabel(t('balanceSheet.assets'), data.totalAssets)}
            headline={headline(data.totalAssets, data.totalAssets < 0)}
            lines={assetLines}
            change={changeText(data.totalAssets, data.compare?.totalAssets)}
          />
          <SummaryColumn
            title={t('balanceSheet.closeLiabilities')}
            ariaLabel={amountLabel(t('balanceSheet.liabilities'), data.totalLiabilities)}
            headline={headline(data.totalLiabilities, data.totalLiabilities < 0)}
            lines={liabilityLines}
            change={changeText(data.totalLiabilities, data.compare?.totalLiabilities)}
          />
          <SummaryColumn
            title={t('balanceSheet.closeEquity')}
            ariaLabel={amountLabel(t('balanceSheet.equity'), data.totalEquity)}
            headline={headline(data.totalEquity, data.totalEquity < 0)}
            lines={equityLines}
            change={changeText(data.totalEquity, data.compare?.totalEquity)}
          />
          <SummaryColumn
            title={t('balanceSheet.equationTitle')}
            ariaLabel={`${t('balanceSheet.equationTitle')}: ${balanceStatus}`}
            headline={
              <Text
                fz="xl"
                fw={700}
                mt={4}
                className={classes.summaryStatus}
                data-balanced={data.isBalanced}
              >
                {balanceStatus}
              </Text>
            }
            lines={equationLines}
          />
        </div>
        <BalanceSheetReading data={data} />
      </Paper>
    </Box>
  );
};
