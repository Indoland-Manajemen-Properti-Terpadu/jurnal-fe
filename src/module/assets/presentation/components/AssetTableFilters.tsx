import { Group, Select, Tabs, TextInput } from '@mantine/core';
import {
  IconCircleCheck,
  IconClockHour4,
  IconListTree,
  IconScale,
  IconSearch,
  IconTrendingDown,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AssetStatus, AssetSummary } from '@/module/assets/domain/asset';
import { ASSET_STATUS_LABEL_KEY } from '@/module/assets/presentation/components/assetStatusMeta';
import { ASSET_SORT_OPTIONS } from '@/module/assets/presentation/hooks/assetSortOptions';

export const ALL_TAB = 'all';

const STATUS_TABS = [
  { value: 'pending', icon: IconClockHour4 },
  { value: 'active', icon: IconCircleCheck },
  { value: 'fully_depreciated', icon: IconTrendingDown },
  { value: 'disposed', icon: IconScale },
] as const satisfies ReadonlyArray<{ value: AssetStatus; icon: unknown }>;

/** Pill tabs, one per status, with the number of assets in brackets once it is known. */
export function AssetStatusTabsList({ counts }: Readonly<{ counts?: AssetSummary['counts'] }>) {
  const { t } = useTranslation('assets');
  const withCount = (label: string, count: number | undefined) =>
    count === undefined ? label : `${label} (${count})`;
  const total = counts
    ? counts.pending + counts.active + counts.fully_depreciated + counts.disposed
    : undefined;

  return (
    <Tabs.List mb="md">
      <Tabs.Tab value={ALL_TAB} leftSection={<IconListTree size={16} />}>
        {withCount(t('allCategories'), total)}
      </Tabs.Tab>
      {STATUS_TABS.map(({ value, icon: TabIcon }) => (
        <Tabs.Tab key={value} value={value} leftSection={<TabIcon size={16} />}>
          {withCount(t(ASSET_STATUS_LABEL_KEY[value]), counts?.[value])}
        </Tabs.Tab>
      ))}
    </Tabs.List>
  );
}

export type AssetListToolbarProps = {
  searchInput: string;
  onSearchChange: (query: string) => void;
  sort: string;
  onSortChange: (sort: string) => void;
};

/** Search and sort on one line, as on the other list pages. */
export function AssetListToolbar({
  searchInput,
  onSearchChange,
  sort,
  onSortChange,
}: Readonly<AssetListToolbarProps>) {
  const { t } = useTranslation('assets');

  return (
    <Group gap="sm" wrap="wrap">
      <TextInput
        placeholder={t('searchPlaceholder')}
        aria-label={t('searchPlaceholder')}
        leftSection={<IconSearch size={16} />}
        value={searchInput}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        w={{ base: '100%', sm: 280 }}
        radius="md"
        size="sm"
      />
      <Select
        aria-label={t('sortLabel')}
        data={ASSET_SORT_OPTIONS.map((option) => ({
          value: option.value,
          label: t(`sort_${option.value}`),
        }))}
        value={sort}
        onChange={(value) => value && onSortChange(value)}
        allowDeselect={false}
        w={{ base: '100%', sm: 220 }}
        radius="md"
        size="sm"
        comboboxProps={{ width: 280, position: 'bottom-start' }}
      />
    </Group>
  );
}
