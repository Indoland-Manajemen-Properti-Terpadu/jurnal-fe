import { ActionIcon, Button, Group, Select, TextInput } from '@mantine/core';
import { IconFilterOff, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DateRange } from '@/module/sales/domain/saleListState';
import {
  SENT_STATUS_FILTERS,
  type SaleStatusFilter,
  type SaleTab,
} from '@/module/sales/domain/saleStatus';
import { DateRangeFilter } from '../shared/DateRangeFilter';

const STATUS_LABEL_KEY: Record<SaleStatusFilter, string> = {
  OPEN: 'status.open',
  DRAFT: 'status.draft',
  UNPAID: 'stats.parts.notDue',
  OVERDUE: 'status.overdue',
  PAID: 'status.paid',
  VOID: 'status.void',
  PARTIAL_PAID: 'status.partialPaid',
  RETURNED: 'status.returned',
};

interface SaleFiltersProps {
  tab: SaleTab;
  searchInput: string;
  onSearchInput: (value: string) => void;
  status: SaleStatusFilter | 'all';
  onStatus: (value: SaleStatusFilter | 'all') => void;
  range: DateRange;
  onRange: (value: DateRange) => void;
  isFiltered: boolean;
  onReset: () => void;
}

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
      label: t(STATUS_LABEL_KEY[code]),
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
      {tab === 'issued' && (
        <Select
          aria-label={t('filter.status')}
          data={statusOptions}
          value={status}
          onChange={(value) => onStatus((value as SaleStatusFilter | 'all') || 'all')}
          allowDeselect={false}
          w={{ base: '100%', sm: 180 }}
        />
      )}
      <DateRangeFilter range={range} onRange={onRange} />
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
