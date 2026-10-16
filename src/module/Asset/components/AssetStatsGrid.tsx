import { Box, Group, Paper, SimpleGrid, Skeleton, Text, ThemeIcon } from '@mantine/core';
import { IconCoins, IconScale, IconTool, IconTrendingDown } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { AssetItem } from '../types/asset';
import { useTranslation } from '@/i18n';

export type AssetStatsGridProps = {
  assets: AssetItem[];
  loading?: boolean;
};

export default function AssetStatsGrid({ assets = [], loading }: AssetStatsGridProps) {
  const { t } = useTranslation('assets');

  const activeAssets = assets.filter((item) => item.status !== 'disposed');

  const totalAcquisitionCost = activeAssets.reduce(
    (sum, item) => sum + (Number(item.acquisitionCost) || 0),
    0
  );

  const totalAccumulatedDepreciation = activeAssets.reduce(
    (sum, item) => sum + (Number(item.accumulatedDepreciation) || 0),
    0
  );

  const totalNetBookValue = activeAssets.reduce(
    (sum, item) => sum + (Number(item.netBookValue) || 0),
    0
  );

  const activeCount = assets.filter((item) => item.status === 'active').length;

  const stats = [
    {
      title: t('totalAcquisitionCost'),
      value: formatCurrency(totalAcquisitionCost),
      subtitle: t('totalAcquisitionCostSub'),
      icon: IconCoins,
      color: 'primary',
    },
    {
      title: t('totalDepreciation'),
      value: formatCurrency(totalAccumulatedDepreciation),
      subtitle: t('totalDepreciationSub'),
      icon: IconTrendingDown,
      color: 'orange',
    },
    {
      title: t('netBookValue'),
      value: formatCurrency(totalNetBookValue),
      subtitle: t('netBookValueSub'),
      icon: IconScale,
      color: 'teal',
    },
    {
      title: t('activeAssetsCount'),
      value: `${activeCount} Unit`,
      subtitle: t('activeAssetsCountSub'),
      icon: IconTool,
      color: 'indigo',
    },
  ];

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={`skeleton-${i}`} withBorder radius="md" p="md" bg="white">
            <Skeleton height={12} width="60%" radius="sm" mb="sm" />
            <Skeleton height={28} width="85%" radius="sm" mb="xs" />
            <Skeleton height={10} width="70%" radius="sm" />
          </Paper>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
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
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                  {stat.title}
                </Text>
                <Text
                  fz={{ base: 20, sm: 22 }}
                  fw={800}
                  c="dark.8"
                  mt={4}
                  lh={1.2}
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}
                >
                  {stat.value}
                </Text>
                <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
                  {stat.subtitle}
                </Text>
              </Box>

              <ThemeIcon
                size={42}
                radius="md"
                variant="light"
                color={stat.color}
                style={{ flexShrink: 0 }}
              >
                <IconComponent size={22} stroke={1.8} />
              </ThemeIcon>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
