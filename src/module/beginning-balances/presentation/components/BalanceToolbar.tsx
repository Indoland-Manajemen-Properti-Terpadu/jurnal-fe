import React from 'react';
import { ActionIcon, Badge, Button, Group, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type Props = {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string | null;
  onCategoryChange: (value: string | null) => void;
  categoryOptions: { value: string; label: string }[];
  selectedDate: string | null;
  onDateChange: (value: string | null) => void;
  accountCount: number;
};

const BalanceToolbar: React.FC<Props> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categoryOptions,
  selectedDate,
  onDateChange,
  accountCount,
}) => {
  const { t } = useTranslation('beginningBalances');

  return (
    <Group justify="space-between" align="center" wrap="wrap" gap="sm">
      <Group gap="sm" style={{ flex: 1, minWidth: 280 }} wrap="wrap">
        <TextInput
          placeholder={t('toolbar.search')}
          size="sm"
          radius="md"
          leftSection={<IconSearch size={16} />}
          rightSection={
            searchQuery ? (
              <ActionIcon variant="subtle" size="xs" onClick={() => onSearchChange('')}>
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          value={searchQuery}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
          style={{ flex: 1, minWidth: 220, maxWidth: 360 }}
        />

        <Select
          placeholder={t('toolbar.categoryFilter')}
          size="sm"
          radius="md"
          data={categoryOptions}
          value={selectedCategory || 'all'}
          onChange={(val) => onCategoryChange(val === 'all' ? null : val)}
          style={{ width: 190 }}
          clearable={false}
        />

        <DatePickerInput
          placeholder={t('toolbar.conversionDate')}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          leftSection={<IconCalendar size={16} />}
          value={selectedDate}
          onChange={onDateChange}
          style={{ width: 170 }}
        />

        {(searchQuery || selectedCategory) && (
          <Button
            variant="subtle"
            color="gray"
            size="sm"
            onClick={() => {
              onSearchChange('');
              onCategoryChange(null);
            }}
            leftSection={<IconX size={14} />}
          >
            {t('toolbar.resetFilter')}
          </Button>
        )}
      </Group>

      <Group gap="xs">
        <Badge variant="light" color="gray" size="lg">
          {t('toolbar.accountCount', { count: accountCount })}
        </Badge>
      </Group>
    </Group>
  );
};

export default BalanceToolbar;
