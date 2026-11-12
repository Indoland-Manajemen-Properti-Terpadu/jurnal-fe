import React from 'react';
import type {
  BalanceSheetAccountItem,
  BalanceSheetData,
} from '@/module/reports/domain/balanceSheet.types';
import {
  displayDate,
  formatCount,
  formatMoney,
  percentOf,
} from '@/module/reports/domain/reportFormat';
import { ReportKpiStrip } from '@/module/reports/presentation/components/shared/ReportKpiStrip';
import {
  ReportSummaryCard,
  type ReportSummaryLine,
} from '@/module/reports/presentation/components/shared/ReportSummaryCard';
import { useTranslation } from '@/i18n';
import { useReportPrecision } from '@/module/reports/presentation/hooks/useReportPrecision';

const STRONG = 'var(--mantine-color-primary-6)';
const MEDIUM = 'var(--mantine-color-primary-3)';

/** At most this many equity accounts get a line of their own; the rest are counted in a note. */
const MAX_EQUITY_LINES = 4;

interface BalanceSheetSummaryProps {
  data: BalanceSheetData;
}

/**
 * Four cards of the shared anatomy, in reading order: what the company owns, what it owes, the
 * owners' share, and the equation that ties them together. Each of the first three shows its
 * parts against its own total; the last compares the two sides and ends with the difference.
 */
export const BalanceSheetSummary: React.FC<BalanceSheetSummaryProps> = ({ data }) => {
  const precision = useReportPrecision();
  const { t } = useTranslation('reports');
  const { assets, liabilities } = data;

  const part = (
    key: string,
    label: string,
    value: number,
    total: number,
    tone: string
  ): ReportSummaryLine => ({ key, label, value, share: percentOf(value, total), tone });

  const assetLines = [
    part(
      'current',
      t('balanceSheet.groupCurrentAssets'),
      assets.totalCurrentAssets,
      data.totalAssets,
      STRONG
    ),
    part(
      'nonCurrent',
      t('balanceSheet.groupNonCurrentAssets'),
      assets.totalNonCurrentAssets,
      data.totalAssets,
      MEDIUM
    ),
    ...(assets.totalDepreciationAmortization !== 0
      ? [
          part(
            'depreciation',
            t('balanceSheet.groupDepreciation'),
            assets.totalDepreciationAmortization,
            data.totalAssets,
            MEDIUM
          ),
        ]
      : []),
  ];

  const isSplit =
    liabilities.currentLiabilities.length > 0 || liabilities.nonCurrentLiabilities.length > 0;
  const liabilityLines = isSplit
    ? [
        part(
          'short',
          t('balanceSheet.groupCurrentLiabilities'),
          liabilities.totalCurrentLiabilities,
          data.totalLiabilities,
          STRONG
        ),
        part(
          'long',
          t('balanceSheet.groupLongTermLiabilities'),
          liabilities.totalNonCurrentLiabilities,
          data.totalLiabilities,
          MEDIUM
        ),
      ]
    : [
        part(
          'all',
          t('balanceSheet.lineLiabilities'),
          data.totalLiabilities,
          data.totalLiabilities,
          STRONG
        ),
      ];

  const equityShown: BalanceSheetAccountItem[] =
    data.equity.length > MAX_EQUITY_LINES
      ? data.equity.slice(0, MAX_EQUITY_LINES - 1)
      : data.equity;
  const equityMore = data.equity.length - equityShown.length;
  const equityLines: ReportSummaryLine[] = [
    ...equityShown.map((item, index) =>
      part(
        `${item.accountId ?? item.accountName}-${index}`,
        item.accountName,
        item.balance,
        data.totalEquity,
        index === 0 ? STRONG : MEDIUM
      )
    ),
    ...(equityMore > 0
      ? [
          {
            key: 'more',
            label: t('balanceSheet.moreEquity', { count: formatCount(equityMore) }),
            value: null,
            share: 0,
            tone: MEDIUM,
          },
        ]
      : []),
  ];

  const peak = Math.max(data.totalAssets, data.totalLiabilitiesAndEquity);
  const gap = Math.abs(data.discrepancy);

  return (
    <ReportKpiStrip
      caption={t('balanceSheet.cardPosition')}
      period={displayDate(data.endDate)}
      items={[
        {
          key: 'assets',
          label: t('balanceSheet.assets'),
          content: (
            <ReportSummaryCard
              title={t('balanceSheet.assets')}
              caption={t('balanceSheet.captionAssets')}
              ariaLabel={`${t('balanceSheet.assets')}: ${formatMoney(data.totalAssets, precision)}`}
              lines={assetLines}
              closing={{ label: t('balanceSheet.closeAssets'), value: data.totalAssets }}
            />
          ),
        },
        {
          key: 'liabilities',
          label: t('balanceSheet.liabilities'),
          content: (
            <ReportSummaryCard
              title={t('balanceSheet.liabilities')}
              caption={t('balanceSheet.captionLiabilities')}
              ariaLabel={`${t('balanceSheet.liabilities')}: ${formatMoney(data.totalLiabilities, precision)}`}
              lines={liabilityLines}
              closing={{ label: t('balanceSheet.closeLiabilities'), value: data.totalLiabilities }}
            />
          ),
        },
        {
          key: 'equity',
          label: t('balanceSheet.equity'),
          content: (
            <ReportSummaryCard
              title={t('balanceSheet.equity')}
              caption={t('balanceSheet.captionEquity')}
              ariaLabel={`${t('balanceSheet.equity')}: ${formatMoney(data.totalEquity, precision)}`}
              lines={equityLines}
              closing={{ label: t('balanceSheet.closeEquity'), value: data.totalEquity }}
            />
          ),
        },
        {
          key: 'equation',
          label: t('balanceSheet.equationTitle'),
          content: (
            <ReportSummaryCard
              title={t('balanceSheet.equationTitle')}
              caption={t('balanceSheet.captionEquation')}
              ariaLabel={`${t('balanceSheet.equationTitle')}: ${formatMoney(data.totalAssets, precision)} / ${formatMoney(data.totalLiabilitiesAndEquity, precision)}`}
              lines={[
                part('assets', t('balanceSheet.lineAssets'), data.totalAssets, peak, STRONG),
                part(
                  'le',
                  t('balanceSheet.lineLiabilitiesEquity'),
                  data.totalLiabilitiesAndEquity,
                  peak,
                  MEDIUM
                ),
              ]}
              closing={{
                label: t('balanceSheet.difference'),
                value: data.isBalanced ? 0 : gap,
                alert: !data.isBalanced,
              }}
            />
          ),
        },
      ]}
    />
  );
};
