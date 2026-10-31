import React from 'react';
import { Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconClock, IconReceipt2 } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { PurchaseBill } from '@/module/purchases/domain/purchase';
import { summarizePurchases } from '@/module/purchases/domain/purchaseTotals';
import { useTranslation } from '@/i18n';

interface PurchaseStatsGridProps {
  bills: PurchaseBill[];
  loading?: boolean;
}

export const PurchaseStatsGrid: React.FC<PurchaseStatsGridProps> = ({
  bills = [],
  loading = false,
}) => {
  const { t } = useTranslation('purchases');
  const stats = React.useMemo(() => summarizePurchases(bills, Date.now()), [bills]);

  const cards = [
    {
      label: t('stats.total'),
      value: formatCurrency(stats.totalAmount),
      desc: t('stats.totalDesc', { count: stats.billCount }),
      icon: IconReceipt2,
      color: 'blue',
    },
    {
      label: t('stats.outstanding'),
      value: formatCurrency(stats.remainingAmount),
      desc: t('stats.outstandingDesc'),
      icon: IconClock,
      color: 'orange',
    },
    {
      label: t('stats.overdue'),
      value: formatCurrency(stats.overdueAmount),
      desc:
        stats.overdueCount > 0
          ? t('stats.overdueDesc', { count: stats.overdueCount })
          : t('stats.overdueNone'),
      icon: IconAlertTriangle,
      color: stats.overdueCount > 0 ? 'red' : 'teal',
    },
    {
      label: t('stats.paid'),
      value: formatCurrency(stats.paidAmount),
      desc: t('stats.paidDesc'),
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
                  fz="var(--jurnal-text-xl)"
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
