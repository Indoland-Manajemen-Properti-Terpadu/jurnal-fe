import React from 'react';
import { Box, SimpleGrid, Text } from '@mantine/core';
import {
  displayDate,
  formatCount,
  formatMoney,
  percentOf,
} from '@/module/reports/domain/reportFormat';
import { countTrialBalanceAccounts, profitMargin } from '@/module/reports/domain/trialBalance';
import {
  TRIAL_BALANCE_GROUPS,
  type TrialBalanceReport,
} from '@/module/reports/domain/trialBalance.types';
import { DebitCreditBars } from '@/module/reports/presentation/components/general-ledger/DebitCreditBars';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import { ReportMiniBars } from '@/module/reports/presentation/components/shared/ReportMiniBars';
import { ReportRing } from '@/module/reports/presentation/components/shared/ReportRing';
import { useTranslation } from '@/i18n';

const percentFormat = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });

interface TrialBalanceSummaryProps {
  report: TrialBalanceReport;
}

/**
 * The same four cards and comparison card as the general ledger: the accounts (a ring of those
 * with a balance), the closing debit and credit (a bar per column group), the profit (a ring of
 * its margin), and under them debit against credit for the closing balance and for profit and loss.
 */
export const TrialBalanceSummary: React.FC<TrialBalanceSummaryProps> = ({ report }) => {
  const { t } = useTranslation('reports');
  const counts = countTrialBalanceAccounts(report.accounts);
  const margin = profitMargin(report);
  const marginText = margin === null ? '' : percentFormat.format(margin);
  const { closing, profitLoss } = report.totals;

  return (
    <ReportKpiStrip
      caption={t('trialBalance.cardPeriod')}
      period={`${displayDate(report.startDate)} — ${displayDate(report.endDate)}`}
      items={[
        {
          key: 'accounts',
          label: t('trialBalance.cardAccounts'),
          value: formatCount(report.pagination.totalRows),
          hint: t('trialBalance.cardAccountsHint', {
            active: formatCount(counts.withBalance),
            detail: formatCount(counts.detail),
          }),
          visual: (
            <Box
              role="img"
              aria-label={t('trialBalance.visualAccounts', {
                active: counts.withBalance,
                detail: counts.detail,
              })}
              title={t('trialBalance.visualAccounts', {
                active: counts.withBalance,
                detail: counts.detail,
              })}
            >
              <ReportRing
                value={percentOf(counts.withBalance, counts.detail)}
                label={`${Math.round(percentOf(counts.withBalance, counts.detail))}%`}
              />
            </Box>
          ),
        },
        {
          key: 'closingDebit',
          label: t('trialBalance.cardClosingDebit'),
          value: formatMoney(closing.debit),
          hint: t('trialBalance.cardClosingDebitHint'),
          visual: (
            <ReportMiniBars
              values={TRIAL_BALANCE_GROUPS.map((group) => report.totals[group].debit)}
              label={t('trialBalance.visualDebit')}
              width={64}
            />
          ),
        },
        {
          key: 'closingCredit',
          label: t('trialBalance.cardClosingCredit'),
          value: formatMoney(closing.credit),
          hint: t('trialBalance.cardClosingCreditHint'),
          visual: (
            <ReportMiniBars
              values={TRIAL_BALANCE_GROUPS.map((group) => report.totals[group].credit)}
              tone="var(--mantine-color-primary-3)"
              label={t('trialBalance.visualCredit')}
              width={64}
            />
          ),
        },
        {
          key: 'profit',
          label: t('trialBalance.cardProfit'),
          value: formatMoney(report.profit),
          hint:
            margin === null
              ? t('trialBalance.cardProfitHint')
              : t('trialBalance.cardProfitHintMargin', { percent: marginText }),
          visual:
            margin === null ? undefined : (
              <Box
                role="img"
                aria-label={t('trialBalance.visualProfit', { percent: marginText })}
                title={t('trialBalance.visualProfit', { percent: marginText })}
              >
                <ReportRing
                  value={margin}
                  label={`${Math.round(margin)}%`}
                  tone={margin < 0 ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-teal-6)'}
                />
              </Box>
            ),
        },
      ]}
      footer={{
        title: t('trialBalance.compareTitle'),
        content: (
          <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl">
            <Box>
              <Text fz="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
                {t('trialBalance.compareClosing')}
              </Text>
              <DebitCreditBars debit={closing.debit} credit={closing.credit} />
            </Box>
            <Box>
              <Text fz="xs" fw={600} c="dimmed" mb={6} tt="uppercase">
                {t('trialBalance.compareProfitLoss')}
              </Text>
              <DebitCreditBars debit={profitLoss.debit} credit={profitLoss.credit} />
            </Box>
          </SimpleGrid>
        ),
      }}
    />
  );
};
