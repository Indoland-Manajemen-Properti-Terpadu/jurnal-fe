import { ActionIcon, Button, Group, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconFilterOff, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SaleDisplayCode } from '@/module/sales/domain/sale';
import type { DateRange } from '@/module/sales/domain/saleListState';
import { SENT_STATUS_FILTERS, type SaleTab } from '@/module/sales/domain/saleStatus';

interface SaleFiltersProps {
  tab: SaleTab;
  searchInput: string;
  onSearchInput: (value: string) => void;
  status: SaleDisplayCode | 'all';
  onStatus: (value: SaleDisplayCode | 'all') => void;
  range: DateRange;
  onRange: (value: DateRange) => void;
  isFiltered: boolean;
  onReset: () => void;
}

const toIso = (value: unknown): string | null => (value ? String(value).slice(0, 10) : null);

export const SaleFilters = ({
  tab,
  searchInput,
  onSearchInput,
  status,
  onStatus,
  range,
  onRange,
  isFiltered,
  onReset,
}: Readonly<SaleFiltersProps>) => {
  const { t } = useTranslation('sales');
  const statusOptions = [
    { value: 'all', label: t('filter.statusAll') },
    ...SENT_STATUS_FILTERS.map((code) => ({
      value: code,
      label: t(`status.${code.toLowerCase()}`),
    })),
  ];

  return (
    <Group gap="sm" wrap="wrap" align="flex-end">
      <TextInput
        placeholder={t('page.searchPlaceholder')}
        aria-label={t('page.searchPlaceholder')}
        leftSection={<IconSearch size={16} />}
        rightSection={
          searchInput ? (
            <ActionIcon
              size="xs"
              variant="subtle"
              color="gray"
              onClick={() => onSearchInput('')}
              aria-label={t('page.clearSearch')}
            >
              <IconX size={12} />
            </ActionIcon>
          ) : null
        }
        value={searchInput}
        onChange={(event) => onSearchInput(event.currentTarget.value)}
        w={{ base: '100%', sm: 320 }}
      />
      {tab === 'sent' && (
        <Select
          aria-label={t('filter.status')}
          data={statusOptions}
          value={status}
          onChange={(value) => onStatus((value as SaleDisplayCode | 'all') || 'all')}
          allowDeselect={false}
          w={{ base: '100%', sm: 180 }}
        />
      )}
      <DatePickerInput
        type="range"
        aria-label={t('filter.date')}
        placeholder={t('filter.datePlaceholder')}
        valueFormat="DD MMM YYYY"
        leftSection={<IconCalendar size={16} />}
        value={range}
        onChange={(value) => onRange([toIso(value[0]), toIso(value[1])])}
        clearable
        w={{ base: '100%', sm: 250 }}
      />
      {isFiltered && (
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconFilterOff size={16} />}
          onClick={onReset}
        >
          {t('filter.reset')}
        </Button>
      )}
    </Group>
  );
};
