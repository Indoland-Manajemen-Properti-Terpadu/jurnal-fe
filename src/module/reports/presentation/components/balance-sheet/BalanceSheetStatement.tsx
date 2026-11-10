import React from 'react';
import { Box, Paper, Stack, Text } from '@mantine/core';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import { useTranslation } from '@/i18n';
import { BalanceSheetTable, type BalanceSheetSection } from './BalanceSheetTable';

interface BalanceSheetStatementProps {
  data: BalanceSheetData;
  searching: boolean;
  currentAssets: BalanceSheetData['assets']['currentAssets'];
  nonCurrentAssets: BalanceSheetData['assets']['nonCurrentAssets'];
  depreciation: BalanceSheetData['assets']['depreciationAmortization'];
  currentLiabilities: BalanceSheetData['liabilities']['currentLiabilities'];
  nonCurrentLiabilities: BalanceSheetData['liabilities']['nonCurrentLiabilities'];
  allLiabilities: BalanceSheetData['liabilities']['allLiabilities'];
  equity: BalanceSheetData['equity'];
}

/**
 * The statement itself: one card, with a title and a line of what it is, holding one bordered
 * table (the same wrapping as the profit and loss and the trial balance). Assets, liabilities and equity are told apart
 * by their section heads and each ends in its own total; a last row adds liabilities and equity so
 * they can be read against the total assets.
 */
export const BalanceSheetStatement: React.FC<BalanceSheetStatementProps> = ({
  data,
  searching,
  currentAssets,
  nonCurrentAssets,
  depreciation,
  currentLiabilities,
  nonCurrentLiabilities,
  allLiabilities,
  equity,
}) => {
  const { t } = useTranslation('reports');
  const isSplit =
    data.liabilities.currentLiabilities.length > 0 ||
    data.liabilities.nonCurrentLiabilities.length > 0;

  const sections: BalanceSheetSection[] = [
    {
      key: 'assets',
      title: t('balanceSheet.assets'),
      groups: [
        {
          key: 'current',
          title: t('balanceSheet.groupCurrentAssets'),
          accounts: currentAssets,
          subtotal: data.assets.totalCurrentAssets,
        },
        {
          key: 'nonCurrent',
          title: t('balanceSheet.groupNonCurrentAssets'),
          accounts: nonCurrentAssets,
          subtotal: data.assets.totalNonCurrentAssets,
        },
        {
          key: 'depreciation',
          title: t('balanceSheet.groupDepreciation'),
          accounts: depreciation,
          subtotal: data.assets.totalDepreciationAmortization,
        },
      ],
      closing: { label: t('balanceSheet.closeAssets'), value: data.totalAssets },
    },
    {
      key: 'liabilities',
      title: t('balanceSheet.liabilities'),
      flat: !isSplit,
      groups: isSplit
        ? [
            {
              key: 'short',
              title: t('balanceSheet.groupCurrentLiabilities'),
              accounts: currentLiabilities,
              subtotal: data.liabilities.totalCurrentLiabilities,
            },
            {
              key: 'long',
              title: t('balanceSheet.groupLongTermLiabilities'),
              accounts: nonCurrentLiabilities,
              subtotal: data.liabilities.totalNonCurrentLiabilities,
            },
          ]
        : [
            {
              key: 'all',
              title: t('balanceSheet.lineLiabilities'),
              accounts: allLiabilities,
              subtotal: data.totalLiabilities,
            },
          ],
      closing: { label: t('balanceSheet.closeLiabilities'), value: data.totalLiabilities },
    },
    {
      key: 'equity',
      title: t('balanceSheet.equity'),
      flat: true,
      groups: [
        {
          key: 'equity',
          title: t('balanceSheet.equity'),
          accounts: equity,
          subtotal: data.totalEquity,
        },
      ],
      closing: { label: t('balanceSheet.closeEquity'), value: data.totalEquity },
    },
  ];

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Box>
          <Text fw={600} fz="md" c="dark.9">
            {t('balanceSheet.tableTitle')}
          </Text>
          <Text fz="xs" c="dimmed">
            {t('balanceSheet.tableHint')}
          </Text>
        </Box>
        <BalanceSheetTable
          sections={sections}
          grandTotal={{
            label: t('balanceSheet.closeLiabilitiesEquity'),
            value: data.totalLiabilitiesAndEquity,
          }}
          searching={searching}
        />
      </Stack>
    </Paper>
  );
};
