import { ActionIcon, Button, Group, Select, TextInput } from '@mantine/core';
import { IconFilterOff, IconSearch, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { DateRange } from '@/module/sales/domain/saleListState';
import { CustomerPicker } from '../shared/CustomerPicker';
import { usePaymentMethods } from '../../hooks/useSaleQueries';
import { DateRangeFilter } from '../shared/DateRangeFilter';

type SalePaymentFiltersProps = {
  searchInput: string;
  onSearchInput: (value: string) => void;
  range: DateRange;
  onRange: (value: DateRange) => void;
  customer: string | null;
  onCustomer: (value: string | null) => void;
  paymentMethod: string | null;
  onPaymentMethod: (value: string | null) => void;
  isFiltered: boolean;
  onReset: () => void;
};

export function SalePaymentFilters({
  searchInput,
  onSearchInput,
  range,
  onRange,
  customer,
  onCustomer,
  paymentMethod,
  onPaymentMethod,
  isFiltered,
  onReset,
}: Readonly<SalePaymentFiltersProps>) {
  const { t } = useTranslation('sales');
  const methodsQuery = usePaymentMethods();
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
      <CustomerPicker
        value={customer}
        onChange={(id) => onCustomer(id)}
        placeholder={t('payments.allCustomers')}
        width={{ base: '100%', sm: 220 }}
      />
      <Select
        aria-label={t('payments.filterMethod')}
        placeholder={t('payments.allMethods')}
        data={(methodsQuery.data ?? []).map((method) => ({ value: method.id, label: method.name }))}
        value={paymentMethod}
        onChange={onPaymentMethod}
        searchable
        clearable
        w={{ base: '100%', sm: 200 }}
      />
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
}

export default SalePaymentFilters;
