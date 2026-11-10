import React from 'react';
import { Box, Divider, Group, Stack, Text } from '@mantine/core';
import { displayDate, formatMoney, percentOf } from '@/module/reports/domain/reportFormat';
import type {
  TrialBalanceReport,
  TrialBalanceSums,
} from '@/module/reports/domain/trialBalance.types';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { useTranslation } from '@/i18n';

/** A difference under a cent is rounding, not a real gap. */
const TOLERANCE = 0.005;

const DEBIT_TONE = 'var(--mantine-color-primary-6)';
const CREDIT_TONE = 'var(--mantine-color-primary-3)';

/** One side of a card: its label, its figure and a bar on the scale shared by the card. */
const Side: React.FC<{ label: string; value: number; peak: number; tone: string }> = ({
  label,
  value,
  peak,
  tone,
}) => (
  <Box>
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Text fz="xs" c="dimmed">
        {label}
      </Text>
      <Text fz="sm" fw={600} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatMoney(value)}
      </Text>
    </Group>
    <Box
      mt={4}
      style={{
        height: 6,
        overflow: 'hidden',
        background: 'var(--mantine-color-gray-1)',
        borderRadius: 999,
      }}
    >
      <Box
        style={{
          width: `${percentOf(value, peak)}%`,
          height: '100%',
          background: tone,
          borderRadius: 999,
        }}
      />
    </Box>
  </Box>
);

interface SummaryCardProps {
  title: string;
  caption: string;
  sums: TrialBalanceSums;
  /** The closing line: what it is called and its figure; `alert` draws it red. */
  result: { label: string; value: number; alert: boolean };
}

/**
 * The anatomy shared by every card: the column group's name and what it is, its debit and credit
 * with a bar each, and one closing line under a rule.
 */
const SummaryCard: React.FC<SummaryCardProps> = ({ title, caption, sums, result }) => {
  const { t } = useTranslation('reports');
  const peak = Math.max(sums.debit, sums.credit);
  const aria = t('trialBalance.cardAria', {
    group: title,
    debit: formatMoney(sums.debit),
    credit: formatMoney(sums.credit),
  });

  return (
    <Stack gap="sm" role="group" aria-label={aria}>
      <Box>
        <Text fz="sm" fw={600} c="dark.9">
          {title}
        </Text>
        <Text fz="xs" c="dimmed">
          {caption}
        </Text>
      </Box>
      <Side label={t('trialBalance.colDebit')} value={sums.debit} peak={peak} tone={DEBIT_TONE} />
      <Side
        label={t('trialBalance.colCredit')}
        value={sums.credit}
        peak={peak}
        tone={CREDIT_TONE}
      />
      <Divider />
      <Group justify="space-between" gap="xs" wrap="nowrap">
        <Text fz="xs" c="dimmed">
          {result.label}
        </Text>
        <Text
          fz="sm"
          fw={700}
          c={result.alert ? 'red.7' : 'dark.9'}
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatMoney(result.value)}
        </Text>
      </Group>
    </Stack>
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
