import { useEffect, useMemo, useState } from 'react';
import { Loader, Select } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from '@/i18n';
import type { CustomerSummary } from '@/module/sales/domain/saleCustomer';
import { useCustomerById, useCustomerSearch } from '../../hooks/useSaleQueries';

type CustomerPickerProps = {
  value: string | null;
  /** The user picked (or cleared) a customer. */
  onChange: (id: string | null, customer: CustomerSummary | null) => void;
  /** The customer behind `value` became known (also for a value set before the picker opened). */
  onResolved?: (customer: CustomerSummary | null) => void;
  label?: string;
  placeholder?: string;
  error?: React.ReactNode;
  withAsterisk?: boolean;
  size?: 'xs' | 'sm' | 'md';
  width?: React.ComponentProps<typeof Select>['w'];
};

/**
 * Finds a customer by typing, asking the server 20 at a time, so it works with any number of
 * contacts. The chosen customer stays in the list (and is fetched by id when it is not among the
 * results, for instance when a draft is reopened).
 */
export function CustomerPicker({
  value,
  onChange,
  onResolved,
  label,
  placeholder,
  error,
  withAsterisk,
  size,
  width,
}: Readonly<CustomerPickerProps>) {
  const { t } = useTranslation('sales');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const [picked, setPicked] = useState<CustomerSummary | null>(null);

  // Mantine writes the chosen name into the search box; that is not something to search for.
  const known = picked && picked.id === value ? picked : null;
  const term = known && search === known.name ? '' : debounced.trim();
  const results = useCustomerSearch(term);
  const found = results.data?.find((customer) => customer.id === value) ?? known;
  const byId = useCustomerById(value, !found);
  const selected = found ?? byId.data ?? null;

  const resolvedKey = selected ? `${selected.id}|${selected.emails.join(',')}` : '';
  useEffect(() => {
    onResolved?.(selected);
    // Reported once per distinct customer, not on every render.
  }, [resolvedKey]);

  const options = useMemo(() => {
    const list = (results.data ?? []).map((customer) => ({
      value: customer.id,
      label: customer.name,
    }));
    if (selected && !list.some((option) => option.value === selected.id)) {
      list.unshift({ value: selected.id, label: selected.name });
    }
    return list;
  }, [results.data, selected]);

  const waiting = results.isFetching || search !== debounced;

  return (
    <Select
      label={label}
      placeholder={placeholder ?? t('customerPicker.placeholder')}
      withAsterisk={withAsterisk}
      size={size}
      w={width}
      error={error}
      data={options}
      value={value}
      searchable
      clearable
      allowDeselect
      searchValue={search}
      onSearchChange={setSearch}
      filter={({ options: all }) => all}
      nothingFoundMessage={waiting ? t('customerPicker.searching') : t('customerPicker.empty')}
      rightSection={waiting && !value ? <Loader size={14} /> : undefined}
      onChange={(id) => {
        const customer = id ? (results.data?.find((c) => c.id === id) ?? null) : null;
        setPicked(customer);
        onChange(id, customer);
      }}
    />
  );
}

export default CustomerPicker;
