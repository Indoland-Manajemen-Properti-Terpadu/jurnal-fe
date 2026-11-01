import { Card, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCategory, IconPackage, IconRuler, type Icon } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type StatCardProps = {
  label: string;
  value: number;
  color: string;
  icon: Icon;
};

function StatCard({ label, value, color, icon: StatIcon }: Readonly<StatCardProps>) {
  return (
    <Card withBorder radius="lg" p="md">
      <Group justify="space-between">
        <div>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
            {label}
          </Text>
          <Text size="xl" fw={800} c="primary.9" mt={4}>
            {value}
          </Text>
        </div>
        <ThemeIcon size={44} radius="md" variant="light" color={color}>
          <StatIcon size={22} />
        </ThemeIcon>
      </Group>
    </Card>
  );
}

type ProductStatsCardsProps = {
  products: number;
  categories: number;
  units: number;
};

export function ProductStatsCards({
  products,
  categories,
  units,
}: Readonly<ProductStatsCardsProps>) {
  const { t } = useTranslation('products');
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <StatCard label={t('list.statTotal')} value={products} color="primary" icon={IconPackage} />
      <StatCard
        label={t('list.statCategories')}
        value={categories}
        color="secondary.8"
        icon={IconCategory}
      />
      <StatCard label={t('list.statUnits')} value={units} color="teal" icon={IconRuler} />
    </SimpleGrid>
  );
}
