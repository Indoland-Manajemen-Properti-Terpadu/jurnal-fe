import { useState } from 'react';
import { Select, type SelectProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from '@/i18n';
import type { ProductRef } from '@/module/purchases/domain/purchaseCommon';
import { useProductOptions } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface ProductPickerProps extends Omit<
  SelectProps,
  'data' | 'value' | 'onChange' | 'searchValue' | 'onSearchChange'
> {
  value: string;
  /** Name of the chosen product, so it stays listed when the search no longer returns it. */
  selectedName: string;
  onChange: (product: ProductRef | null) => void;
}

/** Purchasable products searched as the user types; a service is typed as a description instead. */
export const ProductPicker = ({
  value,
  selectedName,
  onChange,
  ...rest
}: Readonly<ProductPickerProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const { data = [], isFetching } = useProductOptions(debounced.trim());
  const options = data.map((product) => ({ value: product.id, label: product.name }));
  if (value && !options.some((option) => option.value === value)) {
    options.unshift({ value, label: selectedName || value });
  }

  return (
    <Select
      searchable
      clearable
      radius="md"
      placeholder={t('shared.productPlaceholder')}
      nothingFoundMessage={isFetching ? t('shared.searching') : t('shared.noProduct')}
      data={options}
      value={value || null}
      searchValue={search}
      onSearchChange={setSearch}
      onChange={(id) => onChange(data.find((product) => product.id === id) ?? null)}
      filter={({ options: items }) => items}
      {...rest}
    />
  );
};
