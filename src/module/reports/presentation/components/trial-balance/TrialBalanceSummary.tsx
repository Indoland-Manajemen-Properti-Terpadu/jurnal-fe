import React from 'react';
import { Divider, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import {
  displayDate,
  formatCount,
  formatMoney,
  percentOf,
} from '@/module/reports/domain/reportFormat';
import type {
  TrialBalanceReport,
  TrialBalanceSums,
} from '@/module/reports/domain/trialBalance.types';
import { ReportSummaryCard } from '@/module/reports/presentation/components/shared/ReportSummaryCard';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { useTranslation } from '@/i18n';
import {
  useReportNegativeFormat,
  useReportPrecision,
} from '@/module/reports/presentation/hooks/useReportPrecision';

/** A difference under a cent is rounding, not a real gap. */
const TOLERANCE = 0.005;
const compactCurrency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const compactMoney = (value: number, negativeFormat: 'minus' | 'parentheses') => {
  const formatted = compactCurrency.format(Math.abs(value));
  if (value >= 0) return formatted;
  return negativeFormat === 'minus' ? `-${formatted}` : `(${formatted})`;
};

const longDate = (value: string, language: string) => {
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(language === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

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
  const precision = useReportPrecision();
  const negativeFormat = useReportNegativeFormat();
  const { t } = useTranslation('reports');
  const peak = Math.max(sums.debit, sums.credit);

  return (
    <ReportSummaryCard
      title={title}
      caption={caption}
      ariaLabel={t('trialBalance.cardAria', {
        group: title,
        debit: formatMoney(sums.debit, precision, negativeFormat),
        credit: formatMoney(sums.credit, precision, negativeFormat),
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

const StatementBalanceCard: React.FC<{
  title: string;
  amount: number;
  caption: string;
  debit: number;
  credit: number;
}> = ({ title, amount, caption, debit, credit }) => {
  const { t } = useTranslation('reports');
  const negativeFormat = useReportNegativeFormat();
  return (
    <Paper withBorder radius="lg" p="md" bg="white">
      <Text fz="sm" fw={600} c="dimmed">
        {title}
      </Text>
      <Text fz="xl" fw={750} c="dark.9" mt={4}>
        {compactMoney(amount, negativeFormat)}
      </Text>
      <Text fz="xs" c="dimmed" mt={2}>
        {caption}
      </Text>
      <Divider my="md" />
      <Stack gap={4}>
        <Group justify="space-between" gap="sm">
          <Text fz="sm" c="dimmed">
            {t('trialBalance.summaryDebit')}
          </Text>
          <Text fz="sm" fw={600}>
            {compactMoney(debit, negativeFormat)}
          </Text>
        </Group>
        <Group justify="space-between" gap="sm">
          <Text fz="sm" c="dimmed">
            {t('trialBalance.summaryCredit')}
          </Text>
          <Text fz="sm" fw={600}>
            {compactMoney(credit, negativeFormat)}
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
};

const StatementSummary: React.FC<{ report: TrialBalanceReport }> = ({ report }) => {
  const { t, currentLanguage } = useTranslation('reports');
  const negativeFormat = useReportNegativeFormat();
  const { statement } = report;
  if (!statement) return null;
  const balanced = [statement.selisih.open, statement.selisih.move, statement.selisih.close].every(
    (value) => Math.abs(value) < TOLERANCE
  );

  const previousDay = new Date(`${statement.from}T00:00:00`);
  previousDay.setDate(previousDay.getDate() - 1);
  const openingDate = `${previousDay.getFullYear()}-${String(previousDay.getMonth() + 1).padStart(2, '0')}-${String(previousDay.getDate()).padStart(2, '0')}`;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, xl: 4 }} spacing="sm">
      <StatementBalanceCard
        title={t('trialBalance.groupOpening')}
        amount={Math.max(statement.totals.open_debit, statement.totals.open_credit)}
        caption={t('trialBalance.asOfDate', { date: longDate(openingDate, currentLanguage) })}
        debit={statement.totals.open_debit}
        credit={statement.totals.open_credit}
      />
      <StatementBalanceCard
        title={t('trialBalance.groupMovementPeriod')}
        amount={Math.max(statement.totals.debit, statement.totals.credit)}
        caption={t('trialBalance.journalCount', { count: formatCount(statement.journalCount) })}
        debit={statement.totals.debit}
        credit={statement.totals.credit}
      />
      <StatementBalanceCard
        title={t('trialBalance.groupClosing')}
        amount={Math.max(statement.totals.close_debit, statement.totals.close_credit)}
        caption={t('trialBalance.asOfDate', { date: longDate(statement.to, currentLanguage) })}
        debit={statement.totals.close_debit}
        credit={statement.totals.close_credit}
      />
      <Paper withBorder radius="lg" p="md" bg="white">
        <Text fz="sm" fw={600} c="dimmed">
          {t('trialBalance.summaryBalance')}
        </Text>
        <Text fz="xl" fw={750} c={balanced ? 'teal.8' : 'red.7'} mt="sm">
          {t(balanced ? 'trialBalance.balanced' : 'trialBalance.unbalanced')}
        </Text>
        <Text fz="xs" c="dimmed" mt={6}>
          {t(balanced ? 'trialBalance.balancedHint' : 'trialBalance.unbalancedHint')}
        </Text>
        <Divider my="md" />
        <Stack gap={4}>
          {(
            [
              ['opening', t('trialBalance.differenceOpening'), statement.selisih.open],
              ['movement', t('trialBalance.differenceMovement'), statement.selisih.move],
              ['closing', t('trialBalance.differenceClosing'), statement.selisih.close],
            ] as const
          ).map(([key, label, value]) => (
            <Group key={key} justify="space-between" gap="sm">
              <Text fz="sm" c="dimmed">
                {label}
              </Text>
              <Text fz="sm" fw={600} c={Math.abs(value) >= TOLERANCE ? 'red.7' : 'dark.8'}>
                {Math.abs(value) < TOLERANCE ? '–' : compactMoney(Math.abs(value), negativeFormat)}
              </Text>
            </Group>
          ))}
        </Stack>
      </Paper>
    </SimpleGrid>
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
  if (report.statement) return <StatementSummary report={report} />;
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
