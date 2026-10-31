import React from 'react';
import {
  Badge,
  Box,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconBuildingBank, IconCoins, IconFileInvoice } from '@tabler/icons-react';
import type { BalanceSheetData } from '@/module/reports/domain/balanceSheet.types';
import { BalanceSheetAccountTable } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetAccountTable';
import { formatMoney } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';

interface BalanceSheetLayoutViewsProps {
  data: BalanceSheetData;
  viewMode: 'standard' | 'side_by_side';
  filteredCurrentAssets: BalanceSheetData['assets']['currentAssets'];
  filteredNonCurrentAssets: BalanceSheetData['assets']['nonCurrentAssets'];
  filteredDepreciation: BalanceSheetData['assets']['depreciationAmortization'];
  filteredCurrentLiabilities: BalanceSheetData['liabilities']['currentLiabilities'];
  filteredNonCurrentLiabilities: BalanceSheetData['liabilities']['nonCurrentLiabilities'];
  filteredAllLiabilities: BalanceSheetData['liabilities']['allLiabilities'];
  filteredEquity: BalanceSheetData['equity'];
}

export const BalanceSheetLayoutViews: React.FC<BalanceSheetLayoutViewsProps> = ({
  data,
  viewMode,
  filteredCurrentAssets,
  filteredNonCurrentAssets,
  filteredDepreciation,
  filteredCurrentLiabilities,
  filteredNonCurrentLiabilities,
  filteredAllLiabilities,
  filteredEquity,
}) => {
  const { t } = useTranslation('reports');
  // Aset Block (Aktiva)
  const AssetsBlock = (
    <Paper withBorder radius="lg" p="lg" bg="white" shadow="xs">
      <Stack gap="lg">
        {/* Section Header */}
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon color="blue" variant="light" size={38} radius="md">
              <IconBuildingBank size={20} />
            </ThemeIcon>
            <Box>
              <Title order={4} c="dark.9" fw={800}>
                {t('balanceSheet.assets')}
              </Title>
              <Text size="xs" c="dimmed">
                {t('balanceSheet.assetsHint')}
              </Text>
            </Box>
          </Group>
          <Badge size="md" color="blue" variant="light">
            {formatMoney(data.totalAssets)}
          </Badge>
        </Group>

        <Divider />

        {/* 1. Aset Lancar */}
        <BalanceSheetAccountTable
          title={t('balanceSheet.currentAssets')}
          accounts={filteredCurrentAssets}
          subtotal={data.assets.totalCurrentAssets}
          subtotalLabel={t('balanceSheet.totalCurrentAssets')}
          subtotalColor="blue.7"
          emptyText={t('balanceSheet.noCurrentAssets')}
        />

        {/* 2. Aset Tidak Lancar */}
        <BalanceSheetAccountTable
          title={t('balanceSheet.nonCurrentAssets')}
          accounts={filteredNonCurrentAssets}
          subtotal={data.assets.totalNonCurrentAssets}
          subtotalLabel={t('balanceSheet.totalNonCurrentAssets')}
          subtotalColor="blue.7"
          emptyText={t('balanceSheet.noNonCurrentAssets')}
        />

        {/* 3. Depresiasi & Amortisasi */}
        <BalanceSheetAccountTable
          title={t('balanceSheet.depreciation')}
          accounts={filteredDepreciation}
          subtotal={data.assets.totalDepreciationAmortization}
          subtotalLabel={t('balanceSheet.totalDepreciation')}
          subtotalColor="orange.7"
          emptyText={t('balanceSheet.noDepreciation')}
        />

        {/* Total Aset Banner */}
        <Paper
          withBorder
          radius="md"
          p="md"
          bg="blue.0"
          style={{ borderColor: 'var(--mantine-color-blue-3)' }}
        >
          <Group justify="space-between" align="center">
            <Text fw={800} size="sm" c="blue.9">
              {t('balanceSheet.totalAssets')}
            </Text>
            <Text fw={900} size="lg" c="blue.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(data.totalAssets)}
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );

  // Liabilitas & Ekuitas Block (Pasiva)
  const LiabilitiesAndEquityBlock = (
    <Paper withBorder radius="lg" p="lg" bg="white" shadow="xs">
      <Stack gap="lg">
        {/* Section Header: Liabilitas */}
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon color="orange" variant="light" size={38} radius="md">
              <IconFileInvoice size={20} />
            </ThemeIcon>
            <Box>
              <Title order={4} c="dark.9" fw={800}>
                {t('balanceSheet.liabilities')}
              </Title>
              <Text size="xs" c="dimmed">
                {t('balanceSheet.liabilitiesHint')}
              </Text>
            </Box>
          </Group>
          <Badge size="md" color="orange" variant="light">
            {formatMoney(data.totalLiabilities)}
          </Badge>
        </Group>

        <Divider />

        {/* Liabilitas Accounts */}
        {data.liabilities.currentLiabilities.length > 0 ||
        data.liabilities.nonCurrentLiabilities.length > 0 ? (
          <>
            {data.liabilities.currentLiabilities.length > 0 && (
              <BalanceSheetAccountTable
                title={t('balanceSheet.currentLiabilities')}
                accounts={filteredCurrentLiabilities}
                subtotal={data.liabilities.totalCurrentLiabilities}
                subtotalLabel={t('balanceSheet.totalCurrentLiabilities')}
                subtotalColor="orange.7"
              />
            )}
            {data.liabilities.nonCurrentLiabilities.length > 0 && (
              <BalanceSheetAccountTable
                title={t('balanceSheet.longTermLiabilities')}
                accounts={filteredNonCurrentLiabilities}
                subtotal={data.liabilities.totalNonCurrentLiabilities}
                subtotalLabel={t('balanceSheet.totalLongTermLiabilities')}
                subtotalColor="orange.7"
              />
            )}
          </>
        ) : (
          <BalanceSheetAccountTable
            title={t('balanceSheet.liabilityList')}
            accounts={filteredAllLiabilities}
            subtotal={data.totalLiabilities}
            subtotalLabel={t('balanceSheet.totalLiabilities')}
            subtotalColor="orange.7"
            emptyText={t('balanceSheet.noLiabilities')}
          />
        )}

        {/* Total Liabilitas Banner */}
        <Paper
          withBorder
          radius="md"
          p="sm"
          bg="orange.0"
          style={{ borderColor: 'var(--mantine-color-orange-3)' }}
        >
          <Group justify="space-between" align="center">
            <Text fw={700} size="xs" c="orange.9">
              {t('balanceSheet.totalLiabilitiesUpper')}
            </Text>
            <Text fw={800} size="md" c="orange.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(data.totalLiabilities)}
            </Text>
          </Group>
        </Paper>

        <Divider my="sm" />

        {/* Section Header: Ekuitas */}
        <Group justify="space-between" align="center">
          <Group gap="sm" align="center">
            <ThemeIcon color="violet" variant="light" size={38} radius="md">
              <IconCoins size={20} />
            </ThemeIcon>
            <Box>
              <Title order={4} c="dark.9" fw={800}>
                {t('balanceSheet.equity')}
              </Title>
              <Text size="xs" c="dimmed">
                {t('balanceSheet.equityHint')}
              </Text>
            </Box>
          </Group>
          <Badge size="md" color="violet" variant="light">
            {formatMoney(data.totalEquity)}
          </Badge>
        </Group>

        <Divider />

        {/* Ekuitas Accounts */}
        <BalanceSheetAccountTable
          title={t('balanceSheet.equityComponents')}
          accounts={filteredEquity}
          subtotal={data.totalEquity}
          subtotalLabel={t('balanceSheet.totalEquity')}
          subtotalColor="violet.7"
          emptyText={t('balanceSheet.noEquity')}
        />

        {/* Total Liabilitas + Ekuitas Banner */}
        <Paper
          withBorder
          radius="md"
          p="md"
          bg="teal.0"
          style={{ borderColor: 'var(--mantine-color-teal-3)' }}
        >
          <Group justify="space-between" align="center">
            <Box>
              <Text fw={800} size="sm" c="teal.9">
                {t('balanceSheet.totalLiabilitiesAndEquity')}
              </Text>
              <Text size="11px" c="teal.7">
                {t('balanceSheet.totalLiabilitiesPrefix')}
                {formatMoney(data.totalLiabilities)}
                {t('balanceSheet.equityInfix')}
                {formatMoney(data.totalEquity)})
              </Text>
            </Box>
            <Text fw={900} size="lg" c="teal.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(data.totalLiabilitiesAndEquity)}
            </Text>
          </Group>
        </Paper>
      </Stack>
    </Paper>
  );

  if (viewMode === 'side_by_side') {
    return (
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 6 }}>{AssetsBlock}</Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>{LiabilitiesAndEquityBlock}</Grid.Col>
      </Grid>
    );
  }

  return (
    <Stack gap="lg">
      {AssetsBlock}
      {LiabilitiesAndEquityBlock}
    </Stack>
  );
};
