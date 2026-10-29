import { ActionIcon, Group, Select, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

const PAGE_SIZES = [10, 25, 50, 100];

type ProductListToolbarProps = {
  search: string;
  limit: number;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
  onLimitChange: (limit: number) => void;
};

export function ProductListToolbar({
  search,
  limit,
  onSearchChange,
  onSearchClear,
  onLimitChange,
}: Readonly<ProductListToolbarProps>) {
  const { t } = useTranslation('products');
  return (
    <Group justify="space-between" wrap="wrap" gap="sm">
      <TextInput
        placeholder={t('list.searchPlaceholder')}
        leftSection={<IconSearch size={16} />}
        rightSection={
          search ? (
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              onClick={onSearchClear}
              aria-label={t('list.clearSearch')}
            >
              <IconX size={14} />
            </ActionIcon>
          ) : null
        }
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        w={{ base: '100%', sm: 320 }}
      />

      <Group gap="xs">
        <Select
          placeholder={t('list.limitPlaceholder')}
          value={String(limit)}
          onChange={(v) => onLimitChange(Number(v) || 10)}
          data={PAGE_SIZES.map((size) => ({
            value: String(size),
            label: t('list.perPage', { count: size }),
          }))}
          w={140}
        />
      </Group>
    </Group>
  );
}
