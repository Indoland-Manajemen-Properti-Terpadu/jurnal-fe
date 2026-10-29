import { ActionIcon, Badge, Group, Select, Tabs, TextInput, Tooltip } from '@mantine/core';
import { IconRefresh, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  ASSET_SORT_KEYS,
  AssetCategoryCounts,
  DEFAULT_ASSET_SORT,
} from '@/module/assets/domain/assetFilters';
import { getCategoryMeta } from '@/module/assets/presentation/components/assetCategoryMeta';

export type AssetTableFiltersProps = {
  categoryFilter: string;
  onCategoryChange: (category: string) => void;
  counts: AssetCategoryCounts;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
};

const CATEGORY_TABS = [
  { value: 'vehicle', labelKey: 'categoryVehicle' },
  { value: 'building', labelKey: 'categoryBuilding' },
  { value: 'machinery', labelKey: 'categoryMachinery' },
  { value: 'electronic', labelKey: 'categoryElectronic' },
  { value: 'land', labelKey: 'categoryLand' },
] as const;

export function AssetTableFilters({
  categoryFilter,
  onCategoryChange,
  counts,
  searchQuery,
  onSearchChange,
  onClearSearch,
  sortBy,
  onSortChange,
  onRefresh,
  loading,
}: Readonly<AssetTableFiltersProps>) {
  const { t } = useTranslation('assets');

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="md">
      <Tabs
        value={categoryFilter}
        onChange={(val) => onCategoryChange(val || 'all')}
        variant="pills"
        radius="md"
        color="primary"
      >
        <Tabs.List>
          <Tabs.Tab
            value="all"
            rightSection={
              <Badge size="xs" variant="light" color="primary" circle={false}>
                {counts.all}
              </Badge>
            }
          >
            {t('allCategories')}
          </Tabs.Tab>
          {CATEGORY_TABS.map((tab) => {
            const { icon: Icon, listColor } = getCategoryMeta(tab.value);
            return (
              <Tabs.Tab
                key={tab.value}
                value={tab.value}
                leftSection={<Icon size={15} />}
                rightSection={
                  <Badge size="xs" variant="light" color={listColor} circle={false}>
                    {counts[tab.value]}
                  </Badge>
                }
              >
                {t(tab.labelKey)}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>

      <Group gap="xs" style={{ flex: 1, minWidth: 280, justifyContent: 'flex-end' }}>
        <TextInput
          placeholder={t('searchPlaceholder')}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery ? (
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={onClearSearch}>
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          radius="md"
          size="sm"
          style={{ flex: 1, maxWidth: 360 }}
        />

        <Select
          value={sortBy}
          onChange={(val) => onSortChange(val || DEFAULT_ASSET_SORT)}
          data={ASSET_SORT_KEYS.map((key) => ({ value: key, label: t(`sort_${key}`) }))}
          radius="md"
          size="sm"
          w={200}
          comboboxProps={{ position: 'bottom-end', shadow: 'md' }}
        />

        {onRefresh && (
          <Tooltip label={t('refreshData')} withArrow>
            <ActionIcon
              variant="light"
              color="primary"
              size="input-sm"
              radius="md"
              onClick={onRefresh}
              loading={loading}
            >
              <IconRefresh size={16} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
    </Group>
  );
}

export default AssetTableFilters;
