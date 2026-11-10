import React from 'react';
import { Box, Group, Stack, Text } from '@mantine/core';
import { displayDate, formatMoney, percentOf } from '@/module/reports/domain/reportFormat';
import { profitMargin } from '@/module/reports/domain/trialBalance';
import type { TrialBalanceReport } from '@/module/reports/domain/trialBalance.types';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { useTranslation } from '@/i18n';

const percentFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

/** Differences below a cent are rounding, not a real gap. */
const TOLERANCE = 0.005;

interface TrialBalanceSummaryProps {
  report: TrialBalanceReport;
}

/** One side of the closing balance: its label and figure, and a bar on the shared scale. */
const ClosingSide: React.FC<{ label: string; value: number; peak: number; tone: string }> = ({
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
      <Text fz="sm" fw={700} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
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

/**
 * Four cards in reading order: the movement of the period, the closing balance (debit and credit
 * in one card, each with a bar on the same scale), the revenue with its expenses (the profit and
 * loss columns) and the profit they leave, with its margin.
 */
export const TrialBalanceSummary: React.FC<TrialBalanceSummaryProps> = ({ report }) => {
  const { t } = useTranslation('reports');
  const margin = profitMargin(report);
  const { movement, closing, profitLoss } = report.totals;
  const movementGap = Math.abs(movement.debit - movement.credit);
  const peak = Math.max(closing.debit, closing.credit);
  const closingLabel = t('trialBalance.visualClosing', {
    debit: formatMoney(closing.debit),
    credit: formatMoney(closing.credit),
  });

  return (
    <ReportKpiStrip
      caption={t('trialBalance.cardPeriod')}
      period={`${displayDate(report.startDate)} — ${displayDate(report.endDate)}`}
      items={[
        {
          key: 'movement',
          label: t('trialBalance.cardMovement'),
          value: formatMoney(Math.max(movement.debit, movement.credit)),
          hint:
            movementGap < TOLERANCE
              ? t('trialBalance.cardMovementHint')
              : t('trialBalance.cardMovementDiff', { diff: formatMoney(movementGap) }),
        },
        {
          key: 'closing',
          label: t('trialBalance.cardClosing'),
          content: (
            <Box role="img" aria-label={closingLabel} title={closingLabel}>
              <Text fz="sm" c="dimmed" mb="sm">
                {t('trialBalance.cardClosing')}
              </Text>
              <Stack gap="sm">
                <ClosingSide
                  label={t('trialBalance.colDebit')}
                  value={closing.debit}
                  peak={peak}
                  tone="var(--mantine-color-primary-6)"
                />
                <ClosingSide
                  label={t('trialBalance.colCredit')}
                  value={closing.credit}
                  peak={peak}
                  tone="var(--mantine-color-primary-3)"
                />
              </Stack>
            </Box>
          ),
        },
        {
          key: 'revenue',
          label: t('trialBalance.cardRevenue'),
          value: formatMoney(profitLoss.credit),
          hint: t('trialBalance.cardRevenueHint', { expense: formatMoney(profitLoss.debit) }),
        },
        {
          key: 'profit',
          label: t('trialBalance.cardProfit'),
          value: formatMoney(report.profit),
          hint:
            margin === null
              ? t('trialBalance.cardProfitHint')
              : t('trialBalance.cardProfitHintMargin', { percent: percentFormat.format(margin) }),
        },
      ]}
    />
  );
};
