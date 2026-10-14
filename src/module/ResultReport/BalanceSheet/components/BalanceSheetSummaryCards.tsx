import React from 'react';
import {
  Badge,
  Box,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconBuildingBank,
  IconCheck,
  IconCoins,
  IconFileInvoice,
  IconScale,
} from '@tabler/icons-react';
import type { BalanceSheetData } from '../types/balanceSheet.types';
import { displayDate, formatMoney } from '../../utils/reportFormat';

interface BalanceSheetSummaryCardsProps {
  data: BalanceSheetData;
}

export const BalanceSheetSummaryCards: React.FC<BalanceSheetSummaryCardsProps> = ({ data }) => {
  return (
    <Stack gap="sm">
      {/* Date Header Info */}
      <Group justify="space-between" align="center" wrap="wrap" gap="xs">
        <Group gap="xs" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
            Posisi Keuangan Per Tanggal:
          </Text>
          <Text size="sm" fw={700} c="dark.8">
            {displayDate(data.endDate)}
          </Text>
        </Group>

        <Tooltip
          label={
            data.isBalanced
              ? 'Persamaan Akuntansi Terpenuhi: Total Aset = Total Liabilitas + Total Ekuitas.'
              : `Peringatan: Terdapat selisih keseimbangan sebesar ${formatMoney(Math.abs(data.discrepancy))}.`
          }
        >
          <Badge
            size="md"
            variant="light"
            color={data.isBalanced ? 'teal' : 'red'}
            leftSection={data.isBalanced ? <IconCheck size={14} /> : <IconAlertTriangle size={14} />}
          >
            {data.isBalanced
              ? 'Neraca Seimbang (Aset = Liabilitas + Ekuitas)'
              : `Tidak Seimbang (Selisih: ${formatMoney(Math.abs(data.discrepancy))})`}
          </Badge>
        </Tooltip>
      </Group>

      {/* 4 KPI Cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {/* Card 1: Total Aset */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Total Aset (Aktiva)
              </Text>
              <Text size="xl" fw={800} c="blue.7" mt={4} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(data.totalAssets)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="blue" size={38} radius="md">
              <IconBuildingBank size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Aset Lancar, Tetap, & Amortisasi
          </Text>
        </Paper>

        {/* Card 2: Total Liabilitas */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Total Liabilitas (Kewajiban)
              </Text>
              <Text size="xl" fw={800} c="orange.7" mt={4} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(data.totalLiabilities)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="orange" size={38} radius="md">
              <IconFileInvoice size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Kewajiban jangka pendek & panjang
          </Text>
        </Paper>

        {/* Card 3: Total Ekuitas */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Total Ekuitas (Modal)
              </Text>
              <Text size="xl" fw={800} c="violet.7" mt={4} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(data.totalEquity)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="violet" size={38} radius="md">
              <IconCoins size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Modal disetor & saldo laba ditahan
          </Text>
        </Paper>

        {/* Card 4: Total Liabilitas + Ekuitas */}
        <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
          <Group justify="space-between" align="flex-start">
            <Box>
              <Text size="xs" fw={600} c="dimmed" tt="uppercase">
                Liabilitas + Ekuitas (Pasiva)
              </Text>
              <Text size="xl" fw={800} c="teal.7" mt={4} style={{ fontVariantNumeric: 'tabular-nums' }}>
                {formatMoney(data.totalLiabilitiesAndEquity)}
              </Text>
            </Box>
            <ThemeIcon variant="light" color="teal" size={38} radius="md">
              <IconScale size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xs" c="dimmed" mt="xs">
            Harus sama dengan Total Aset
          </Text>
        </Paper>
      </SimpleGrid>
    </Stack>
  );
};

