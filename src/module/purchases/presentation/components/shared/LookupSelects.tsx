import { useState } from 'react';
import { Select, type SelectProps } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { useTranslation } from '@/i18n';
import type { PartyRef, ProductRef } from '@/module/purchases/domain/purchaseCommon';
import {
  useProductOptions,
  useSupplierOptions,
} from '@/module/purchases/presentation/hooks/usePurchaseQueries';

type PickerProps = Omit<SelectProps, 'data' | 'searchValue' | 'onSearchChange' | 'onChange'>;

interface SupplierSelectProps extends PickerProps {
  value: string | null;
  onChange: (id: string | null, vendor: PartyRef | null) => void;
  /** Vendor already chosen elsewhere (for example from a document); keeps it listed. */
  selected?: PartyRef | null;
}

/** Suppliers searched on the server as the user types. */
export const SupplierSelect = ({
  value,
  onChange,
  selected,
  ...rest
}: Readonly<SupplierSelectProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const { data = [], isFetching } = useSupplierOptions(debounced.trim());
  const options = selected && !data.some((v) => v.id === selected.id) ? [selected, ...data] : data;

  return (
    <Select
      searchable
      radius="md"
      placeholder={t('shared.supplierPlaceholder')}
      nothingFoundMessage={isFetching ? t('shared.searching') : t('shared.noSupplier')}
      data={options.map((vendor) => ({ value: vendor.id, label: vendor.name }))}
      value={value}
      searchValue={search}
      onSearchChange={setSearch}
      onChange={(id) => onChange(id, options.find((vendor) => vendor.id === id) ?? null)}
      filter={({ options: items }) => items}
      {...rest}
    />
  );
};

interface ProductSelectProps extends PickerProps {
  value: string | null;
  onChange: (id: string | null, product: ProductRef | null) => void;
}

/** Products flagged as purchasable; services without a product are typed as a description instead. */
export const ProductSelect = ({ value, onChange, ...rest }: Readonly<ProductSelectProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const { data = [], isFetching } = useProductOptions(debounced.trim());

  return (
    <Select
      searchable
      clearable
      radius="md"
      placeholder={t('shared.productPlaceholder')}
      nothingFoundMessage={isFetching ? t('shared.searching') : t('shared.noProduct')}
      data={data.map((product) => ({ value: product.id, label: product.name }))}
      value={value}
      searchValue={search}
      onSearchChange={setSearch}
      onChange={(id) => onChange(id, data.find((product) => product.id === id) ?? null)}
      filter={({ options: items }) => items}
      {...rest}
    />
  );
};
