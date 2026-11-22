import { useState } from 'react';
import { Group, Select, Text, type SelectProps } from '@mantine/core';
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
  /** Lists only goods (stock-tracked products) or only services. */
  kind?: 'GOODS' | 'SERVICE';
  onChange: (product: ProductRef | null) => void;
}

/** Purchasable products searched as the user types, narrowed to the kind of the line. */
export const ProductPicker = ({
  value,
  selectedName,
  kind,
  onChange,
  ...rest
}: Readonly<ProductPickerProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const { data = [], isFetching } = useProductOptions(debounced.trim());
  const listed = kind ? data.filter((product) => product.isInventory === (kind === 'GOODS')) : data;
  const options = listed.map((product) => ({ value: product.id, label: product.name }));
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
      renderOption={({ option }) => {
        const product = data.find((item) => item.id === option.value);
        return (
          <Group justify="space-between" wrap="nowrap" gap="sm" w="100%">
            <div style={{ minWidth: 0 }}>
              <Text size="sm" truncate>
                {option.label}
              </Text>
              {product?.sku && (
                <Text size="xs" c="dimmed">
                  {product.sku}
                </Text>
              )}
            </div>
            {product && (
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {t(`requests.kind.${product.isInventory ? 'GOODS' : 'SERVICE'}`)}
              </Text>
            )}
          </Group>
        );
      }}
      value={value || null}
      searchValue={search}
      onSearchChange={setSearch}
      onChange={(id) => onChange(listed.find((product) => product.id === id) ?? null)}
      filter={({ options: items }) => items}
      {...rest}
    />
  );
};
