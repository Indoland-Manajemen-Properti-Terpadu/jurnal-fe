import { useState } from 'react';
import { MultiSelect, Select, type MultiSelectProps, type SelectProps } from '@mantine/core';
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
  /** Vendors that must not be offered, for example the ones that already have a quote. */
  excludeIds?: readonly string[];
}

/**
 * The vendors to offer: the search result plus the one already chosen elsewhere, without the
 * excluded ones. The vendor currently picked stays listed even when it is on the exclusion list.
 */
export const offeredVendors = (
  found: PartyRef[],
  selected: PartyRef | null | undefined,
  value: string | null,
  excludeIds?: readonly string[]
): PartyRef[] => {
  const listed =
    selected && !found.some((v) => v.id === selected.id) ? [selected, ...found] : found;
  return excludeIds?.length
    ? listed.filter((vendor) => vendor.id === value || !excludeIds.includes(vendor.id))
    : listed;
};

/** Suppliers searched on the server as the user types. */
export const SupplierSelect = ({
  value,
  onChange,
  selected,
  excludeIds,
  ...rest
}: Readonly<SupplierSelectProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const { data = [], isFetching } = useSupplierOptions(debounced.trim());
  const options = offeredVendors(data, selected, value, excludeIds);

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

type MultiPickerProps = Omit<
  MultiSelectProps,
  'data' | 'searchValue' | 'onSearchChange' | 'onChange' | 'value'
>;

interface SupplierMultiSelectProps extends MultiPickerProps {
  value: string[];
  /** The vendors already chosen, so their names stay listed while the search changes. */
  selected: Pick<PartyRef, 'id' | 'name'>[];
  onChange: (ids: string[], vendors: Pick<PartyRef, 'id' | 'name'>[]) => void;
}

/** Several suppliers searched on the server as the user types; the chosen ones stay in the list. */
export const SupplierMultiSelect = ({
  value,
  selected,
  onChange,
  ...rest
}: Readonly<SupplierMultiSelectProps>) => {
  const { t } = useTranslation('purchases');
  const [search, setSearch] = useState('');
  const [debounced] = useDebouncedValue(search, 300);
  const { data = [], isFetching } = useSupplierOptions(debounced.trim());
  const options = [
    ...selected,
    ...data.filter((vendor) => !selected.some((s) => s.id === vendor.id)),
  ];

  return (
    <MultiSelect
      searchable
      clearable
      radius="md"
      placeholder={value.length === 0 ? t('shared.supplierPlaceholder') : undefined}
      nothingFoundMessage={isFetching ? t('shared.searching') : t('shared.noSupplier')}
      data={options.map((vendor) => ({ value: vendor.id, label: vendor.name }))}
      value={value}
      searchValue={search}
      onSearchChange={setSearch}
      onChange={(ids) =>
        onChange(
          ids,
          options.filter((vendor) => ids.includes(vendor.id))
        )
      }
      filter={({ options: items }) => items}
      {...rest}
    />
  );
};
