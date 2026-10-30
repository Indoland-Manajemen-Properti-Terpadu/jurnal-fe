import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import {
  IconAlertTriangle,
  IconCheck,
  IconClock,
  IconReceipt2,
} from '@tabler/icons-react';
import { formatCompactIDR, formatIDR } from '@/module/sales/domain/saleFormat';

type SaleStatsProps = {
  totalCount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  overdueCount: number;
};

export function SaleStatsGrid({
  totalCount,
  totalAmount,
  paidAmount,
  remainingAmount,
  overdueCount,
}: Readonly<SaleStatsProps>) {
  const stats = [
    {
      title: 'Total Penjualan',
      value: formatCompactIDR(totalAmount),
      subtext: `${totalCount} faktur tercatat`,
      icon: IconReceipt2,
      color: 'primary',
    },
    {
      title: 'Sisa Tagihan (Piutang)',
      value: formatCompactIDR(remainingAmount),
      subtext: 'Menunggu pelunasan',
      icon: IconClock,
      color: 'orange',
    },
    {
      title: 'Sudah Diterima (Lunas)',
      value: formatCompactIDR(paidAmount),
      subtext: 'Pembayaran terverifikasi',
      icon: IconCheck,
      color: 'teal',
    },
    {
      title: 'Lewat Jatuh Tempo',
      value: `${overdueCount} Faktur`,
      subtext: overdueCount > 0 ? 'Perlu tindak lanjut' : 'Tidak ada tunggakan',
      icon: IconAlertTriangle,
      color: overdueCount > 0 ? 'red' : 'gray',
    },
  ];

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {stats.map((stat) => {
        const StatIcon = stat.icon;
        return (
          <Paper
            key={stat.title}
            withBorder
            radius="md"
            p="md"
            bg="white"
            style={{
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
          >
            <Group justify="space-between" align="flex-start">
              <div>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                  {stat.title}
                </Text>
                <Text fz={22} fw={800} c="dark.8" mt={4} lh={1.15}>
                  {stat.value}
                </Text>
                <Text size="xs" c="dimmed" mt={4}>
                  {stat.subtext}
                </Text>
              </div>
              <ThemeIcon size={42} radius="md" variant="light" color={stat.color}>
                <StatIcon size={22} />
              </ThemeIcon>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}

export default SaleStatsGrid;

