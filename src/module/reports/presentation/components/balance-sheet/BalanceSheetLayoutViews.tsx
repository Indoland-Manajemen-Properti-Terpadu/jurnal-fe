import React from 'react';
import { Box, Divider, Group, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBuildingBank, IconCoins, IconFileInvoice } from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import { BalanceSheetAccountTable } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetAccountTable';
import { formatMoney } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

interface BalanceSheetLayoutViewsProps {
  data: BalanceSheetData;
  filteredCurrentAssets: BalanceSheetData['assets']['currentAssets'];
  filteredNonCurrentAssets: BalanceSheetData['assets']['nonCurrentAssets'];
  filteredDepreciation: BalanceSheetData['assets']['depreciationAmortization'];
  filteredCurrentLiabilities: BalanceSheetData['liabilities']['currentLiabilities'];
  filteredNonCurrentLiabilities: BalanceSheetData['liabilities']['nonCurrentLiabilities'];
  filteredAllLiabilities: BalanceSheetData['liabilities']['allLiabilities'];
  filteredEquity: BalanceSheetData['equity'];
}

const SectionHeader = ({
  icon: SectionIcon,
  title,
  hint,
  total,
}: {
  icon: Icon;
  title: string;
  hint: string;
  total: number;
}) => (
  <Group justify="space-between" align="center" wrap="nowrap" gap="md">
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon color="primary" variant="light" size={40} radius="md">
        <SectionIcon size={20} />
      </ThemeIcon>
      <Box>
        <Text fw={700} fz="lg" c="dark.9" lh={1.2}>
          {title}
        </Text>
        <Text fz="xs" c="dimmed">
          {hint}
        </Text>
      </Box>
    </Group>
    <Text fw={700} fz="md" c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatMoney(total)}
    </Text>
  </Group>
);

/** The closing line of a side of the balance sheet. */
const GrandTotal = ({ label, value, note }: { label: string; value: number; note?: string }) => (
  <Paper
    radius="md"
    p="md"
    bg="primary.0"
    style={{ border: '1px solid var(--mantine-color-primary-2)' }}
  >
    <Group justify="space-between" align="center" wrap="nowrap" gap="md">
      <Box>
        <Text fw={700} fz="sm" c="primary.9">
          {label}
        </Text>
        {note && (
          <Text fz="xs" c="primary.8">
            {note}
          </Text>
        )}
      </Box>
      <Text fw={700} fz="lg" c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
        {formatMoney(value)}
      </Text>
    </Group>
  </Paper>
);

/** A subtotal between two sections of the same side (total liabilities). */
const SideSubtotal = ({ label, value }: { label: string; value: number }) => (
  <Group
    justify="space-between"
    px="xs"
    py="xs"
    style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}
  >
    <Text fz="sm" fw={700} c="dark.9">
      {label}
    </Text>
    <Text fz="sm" fw={700} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatMoney(value)}
    </Text>
  </Group>
);

export const BalanceSheetLayoutViews: React.FC<BalanceSheetLayoutViewsProps> = ({
  data,
  filteredCurrentAssets,
  filteredNonCurrentAssets,
  filteredDepreciation,
  filteredCurrentLiabilities,
  filteredNonCurrentLiabilities,
  filteredAllLiabilities,
  filteredEquity,
}) => {
  const { t } = useTranslation('reports');
  const hasSplitLiabilities =
    data.liabilities.currentLiabilities.length > 0 ||
    data.liabilities.nonCurrentLiabilities.length > 0;

  const assetsBlock = (
    <Paper withBorder radius="lg" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <SectionHeader
          icon={IconBuildingBank}
          title={t('balanceSheet.assets')}
          hint={t('balanceSheet.assetsHint')}
          total={data.totalAssets}
        />
        <Divider />

        <BalanceSheetAccountTable
          title={t('balanceSheet.currentAssets')}
          accounts={filteredCurrentAssets}
          subtotal={data.assets.totalCurrentAssets}
          sideTotal={data.totalAssets}
          emptyText={t('balanceSheet.noCurrentAssets')}
        />
        <BalanceSheetAccountTable
          title={t('balanceSheet.nonCurrentAssets')}
          accounts={filteredNonCurrentAssets}
          subtotal={data.assets.totalNonCurrentAssets}
          sideTotal={data.totalAssets}
          emptyText={t('balanceSheet.noNonCurrentAssets')}
        />
        <BalanceSheetAccountTable
          title={t('balanceSheet.depreciation')}
          accounts={filteredDepreciation}
          subtotal={data.assets.totalDepreciationAmortization}
          emptyText={t('balanceSheet.noDepreciation')}
        />

        <GrandTotal label={t('balanceSheet.totalAssets')} value={data.totalAssets} />
      </Stack>
    </Paper>
  );

  const liabilitiesAndEquityBlock = (
    <Paper withBorder radius="lg" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <SectionHeader
          icon={IconFileInvoice}
          title={t('balanceSheet.liabilities')}
          hint={t('balanceSheet.liabilitiesHint')}
          total={data.totalLiabilities}
        />
        <Divider />

        {hasSplitLiabilities ? (
          <>
            {data.liabilities.currentLiabilities.length > 0 && (
              <BalanceSheetAccountTable
                title={t('balanceSheet.currentLiabilities')}
                accounts={filteredCurrentLiabilities}
                subtotal={data.liabilities.totalCurrentLiabilities}
                sideTotal={data.totalLiabilitiesAndEquity}
              />
            )}
            {data.liabilities.nonCurrentLiabilities.length > 0 && (
              <BalanceSheetAccountTable
                title={t('balanceSheet.longTermLiabilities')}
                accounts={filteredNonCurrentLiabilities}
                subtotal={data.liabilities.totalNonCurrentLiabilities}
                sideTotal={data.totalLiabilitiesAndEquity}
              />
            )}
          </>
        ) : (
          <BalanceSheetAccountTable
            title={t('balanceSheet.liabilityList')}
            accounts={filteredAllLiabilities}
            subtotal={data.totalLiabilities}
            emptyText={t('balanceSheet.noLiabilities')}
          />
        )}
        <SideSubtotal label={t('balanceSheet.totalLiabilities')} value={data.totalLiabilities} />

        <Box mt="md">
          <SectionHeader
            icon={IconCoins}
            title={t('balanceSheet.equity')}
            hint={t('balanceSheet.equityHint')}
            total={data.totalEquity}
          />
        </Box>
        <Divider />

        <BalanceSheetAccountTable
          title={t('balanceSheet.equityComponents')}
          accounts={filteredEquity}
          subtotal={data.totalEquity}
          sideTotal={data.totalLiabilitiesAndEquity}
          emptyText={t('balanceSheet.noEquity')}
        />
        <SideSubtotal label={t('balanceSheet.totalEquity')} value={data.totalEquity} />

        <GrandTotal
          label={t('balanceSheet.totalLiabilitiesAndEquity')}
          value={data.totalLiabilitiesAndEquity}
          note={`${t('balanceSheet.totalLiabilitiesPrefix')}${formatMoney(data.totalLiabilities)}${t('balanceSheet.equityInfix')}${formatMoney(data.totalEquity)})`}
        />
      </Stack>
    </Paper>
  );

  return (
    <Stack gap="lg">
      {assetsBlock}
      {liabilitiesAndEquityBlock}
    </Stack>
  );
};
