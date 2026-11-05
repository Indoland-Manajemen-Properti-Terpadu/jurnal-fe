import { ActionIcon, Group, TextInput } from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type ProductListToolbarProps = {
  search: string;
  onSearchChange: (value: string) => void;
  onSearchClear: () => void;
};

export function ProductListToolbar({
  search,
  onSearchChange,
  onSearchClear,
}: Readonly<ProductListToolbarProps>) {
  const { t } = useTranslation('products');
  return (
    <Group gap="sm" wrap="wrap" align="flex-end">
      <TextInput
        placeholder={t('list.searchPlaceholder')}
        aria-label={t('list.searchPlaceholder')}
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
              <IconX size={12} />
            </ActionIcon>
          ) : null
        }
        value={search}
        onChange={(event) => onSearchChange(event.currentTarget.value)}
        w={{ base: '100%', sm: 320 }}
      />
    </Group>
  );
}
