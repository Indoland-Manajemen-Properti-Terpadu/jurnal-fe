import { ActionIcon, Button, Group, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconFilterOff, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DateRange } from '@/module/sales/domain/saleListState';
import type { OverpaymentFilter } from '@/module/sales/domain/salePaymentList';

type SalePaymentFiltersProps = {
  searchInput: string;
  onSearchInput: (value: string) => void;
  range: DateRange;
  onRange: (value: DateRange) => void;
  overpayment: OverpaymentFilter;
  onOverpayment: (value: OverpaymentFilter) => void;
  isFiltered: boolean;
  onReset: () => void;
};

const toIso = (value: unknown): string | null => (value ? String(value).slice(0, 10) : null);

export function SalePaymentFilters({
  searchInput,
  onSearchInput,
  range,
  onRange,
  overpayment,
  onOverpayment,
  isFiltered,
  onReset,
}: Readonly<SalePaymentFiltersProps>) {
  const { t } = useTranslation('sales');
  return (
    <Group gap="sm" wrap="wrap" align="flex-end">
      <TextInput
        placeholder={t('payments.searchPlaceholder')}
        aria-label={t('payments.searchPlaceholder')}
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
      <Select
        aria-label={t('payments.filterOverpayment')}
        data={[
          { value: 'all', label: t('payments.overpaymentAll') },
          { value: 'yes', label: t('payments.overpaymentYes') },
          { value: 'no', label: t('payments.overpaymentNo') },
        ]}
        value={overpayment}
        onChange={(value) => onOverpayment((value as OverpaymentFilter) || 'all')}
        allowDeselect={false}
        w={{ base: '100%', sm: 220 }}
      />
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
}

export default SalePaymentFilters;
