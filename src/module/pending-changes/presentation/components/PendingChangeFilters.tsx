import { Group, Select, Text, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type PendingChangeFiltersProps = {
  search: string;
  pageSize: string;
  onSearchChange: (value: string) => void;
  onPageSizeChange: (value: string) => void;
};

export default function PendingChangeFilters({
  search,
  pageSize,
  onSearchChange,
  onPageSizeChange,
}: PendingChangeFiltersProps) {
  const { t } = useTranslation('pendingChanges');

  return (
    <Group justify="space-between" wrap="wrap" gap="md">
      <TextInput
        placeholder={t('searchPlaceholder')}
        leftSection={<IconSearch size={16} />}
        value={search}
        onChange={(e) => onSearchChange(e.currentTarget.value)}
        w={{ base: '100%', sm: 280 }}
        radius="md"
        size="sm"
      />

      <Group gap="xs">
        <Text size="xs" c="dimmed">
          {t('showRows')}
        </Text>
        <Select
          data={['10', '25', '50']}
          value={pageSize}
          onChange={(val) => onPageSizeChange(val || '10')}
          w={90}
          radius="md"
          size="sm"
        />
      </Group>
    </Group>
  );
}
