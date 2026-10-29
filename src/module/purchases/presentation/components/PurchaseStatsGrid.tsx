import React from 'react';
import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconClock, IconReceipt2 } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { PurchaseBill } from '@/module/purchases/domain/purchase';

interface PurchaseStatsGridProps {
  bills: PurchaseBill[];
  loading?: boolean;
}

export const PurchaseStatsGrid: React.FC<PurchaseStatsGridProps> = ({
  bills = [],
  loading = false,
}) => {
  const stats = React.useMemo(() => {
    let totalAmt = 0;
    let paidAmt = 0;
    let unpaidAmt = 0;
    let overdueAmt = 0;
    let overdueCount = 0;

    const now = Date.now();
    bills.forEach((b) => {
      totalAmt += b.totalAmount || 0;
      paidAmt += b.paidAmount || 0;
      unpaidAmt += b.remainingAmount || 0;

      const isDue = b.remainingAmount > 0 && b.dueDate && new Date(b.dueDate).getTime() < now;
      if (isDue) {
        overdueAmt += b.remainingAmount || 0;
        overdueCount += 1;
      }
    });

    return {
      totalAmt,
      paidAmt,
      unpaidAmt,
      overdueAmt,
      overdueCount,
      totalCount: bills.length,
    };
  }, [bills]);

  const cards = [
    {
      label: 'Total Tagihan Masuk',
      value: formatCurrency(stats.totalAmt),
      desc: `${stats.totalCount} faktur tagihan tercatat`,
      icon: IconReceipt2,
      color: 'blue',
    },
    {
      label: 'Sisa Hutang Usaha',
      value: formatCurrency(stats.unpaidAmt),
      desc: 'Kewajiban berjalan kepada vendor',
      icon: IconClock,
      color: 'orange',
    },
    {
      label: 'Hutang Jatuh Tempo',
      value: formatCurrency(stats.overdueAmt),
      desc:
        stats.overdueCount > 0
          ? `${stats.overdueCount} tagihan melewati tempo`
          : 'Tidak ada tunggakan',
      icon: IconAlertTriangle,
      color: stats.overdueCount > 0 ? 'red' : 'teal',
    },
    {
      label: 'Total Telah Dibayar',
      value: formatCurrency(stats.paidAmt),
      desc: 'Pelunasan faktur vendor',
      icon: IconCheck,
      color: 'teal',
    },
  ];

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} height={100} radius="lg" />
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <Paper
            key={c.label}
            withBorder
            radius="lg"
            p="md"
            bg="white"
            style={{
              transition: 'transform 180ms ease, box-shadow 180ms ease',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Stack gap={2} style={{ minWidth: 0 }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.5}>
                  {c.label}
                </Text>
                <Text
                  fz={20}
                  fw={800}
                  c="dark.9"
                  mt={4}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                  truncate
                >
                  {c.value}
                </Text>
                <Text size="xs" c="dimmed" mt={2} truncate>
                  {c.desc}
                </Text>
              </Stack>

              <ThemeIcon size={38} radius="md" color={c.color} variant="light">
                <Icon size={20} />
              </ThemeIcon>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
};
