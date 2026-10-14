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
import {
  IconBuildingBank,
  IconCoins,
  IconFileInvoice,
  IconScale,
} from '@tabler/icons-react';
import type { BalanceSheetData } from '../types/balanceSheet.types';
import { BalanceSheetAccountTable } from './BalanceSheetAccountTable';
import { formatMoney } from '../../utils/reportFormat';

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
                Aset (Aktiva)
              </Title>
              <Text size="xs" c="dimmed">
                Kas, piutang, aset tetap & akumulasi penyusutan
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
          title="Aset Lancar (Current Assets)"
          accounts={filteredCurrentAssets}
          subtotal={data.assets.totalCurrentAssets}
          subtotalLabel="Total Aset Lancar"
          subtotalColor="blue.7"
          emptyText="Tidak ada akun aset lancar tercatat."
        />

        {/* 2. Aset Tidak Lancar */}
        <BalanceSheetAccountTable
          title="Aset Tidak Lancar (Non-Current Assets)"
          accounts={filteredNonCurrentAssets}
          subtotal={data.assets.totalNonCurrentAssets}
          subtotalLabel="Total Aset Tidak Lancar"
          subtotalColor="blue.7"
          emptyText="Tidak ada akun aset tetap/tidak lancar tercatat."
        />

        {/* 3. Depresiasi & Amortisasi */}
        <BalanceSheetAccountTable
          title="Akumulasi Depresiasi & Amortisasi"
          accounts={filteredDepreciation}
          subtotal={data.assets.totalDepreciationAmortization}
          subtotalLabel="Total Akumulasi Depresiasi & Amortisasi"
          subtotalColor="orange.7"
          emptyText="Tidak ada akumulasi penyusutan/amortisasi."
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
              TOTAL ASET (AKTIVA)
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
                Liabilitas (Kewajiban)
              </Title>
              <Text size="xs" c="dimmed">
                Hutang jangka pendek & hutang jangka panjang
              </Text>
            </Box>
          </Group>
          <Badge size="md" color="orange" variant="light">
            {formatMoney(data.totalLiabilities)}
          </Badge>
        </Group>

        <Divider />

        {/* Liabilitas Accounts */}
        {data.liabilities.currentLiabilities.length > 0 || data.liabilities.nonCurrentLiabilities.length > 0 ? (
          <>
            {data.liabilities.currentLiabilities.length > 0 && (
              <BalanceSheetAccountTable
                title="Kewajiban Lancar (Current Liabilities)"
                accounts={filteredCurrentLiabilities}
                subtotal={data.liabilities.totalCurrentLiabilities}
                subtotalLabel="Total Kewajiban Lancar"
                subtotalColor="orange.7"
              />
            )}
            {data.liabilities.nonCurrentLiabilities.length > 0 && (
              <BalanceSheetAccountTable
                title="Kewajiban Jangka Panjang (Long-Term Liabilities)"
                accounts={filteredNonCurrentLiabilities}
                subtotal={data.liabilities.totalNonCurrentLiabilities}
                subtotalLabel="Total Kewajiban Jangka Panjang"
                subtotalColor="orange.7"
              />
            )}
          </>
        ) : (
          <BalanceSheetAccountTable
            title="Daftar Liabilitas & Hutang"
            accounts={filteredAllLiabilities}
            subtotal={data.totalLiabilities}
            subtotalLabel="Total Liabilitas"
            subtotalColor="orange.7"
            emptyText="Tidak ada akun liabilitas tercatat."
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
              TOTAL LIABILITAS
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
                Ekuitas (Modal)
              </Title>
              <Text size="xs" c="dimmed">
                Modal disetor, tambahan modal & laba ditahan
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
          title="Komponen Ekuitas & Laba Ditahan"
          accounts={filteredEquity}
          subtotal={data.totalEquity}
          subtotalLabel="Total Ekuitas"
          subtotalColor="violet.7"
          emptyText="Tidak ada akun ekuitas tercatat."
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
                TOTAL LIABILITAS & EKUITAS (PASIVA)
              </Text>
              <Text size="11px" c="teal.7">
                Total Kewajiban ({formatMoney(data.totalLiabilities)}) + Modal ({formatMoney(data.totalEquity)})
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
        <Grid.Col span={{ base: 12, lg: 6 }}>
          {AssetsBlock}
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }}>
          {LiabilitiesAndEquityBlock}
        </Grid.Col>
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
