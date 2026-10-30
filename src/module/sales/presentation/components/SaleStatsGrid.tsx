import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconAlertTriangle, IconCheck, IconClock, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCompactIDR } from '../../domain/saleFormat';

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
  const { t } = useTranslation('sales');
  const stats = [
    {
      title: t('stats.total'),
      value: formatCompactIDR(totalAmount),
      subtext: t('stats.totalDesc', { count: totalCount }),
      icon: IconReceipt2,
      color: 'primary',
    },
    {
      title: t('stats.outstanding'),
      value: formatCompactIDR(remainingAmount),
      subtext: t('stats.outstandingDesc'),
      icon: IconClock,
      color: 'orange',
    },
    {
      title: t('stats.received'),
      value: formatCompactIDR(paidAmount),
      subtext: t('stats.receivedDesc'),
      icon: IconCheck,
      color: 'teal',
    },
    {
      title: t('stats.overdue'),
      value: t('stats.overdueValue', { count: overdueCount }),
      subtext: overdueCount > 0 ? t('stats.overdueFollowUp') : t('stats.overdueNone'),
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
