import { Select } from '@mantine/core';
import type { AccountOption } from '@/module/assets/domain/asset';

export type AccountSelectProps = {
  label: string;
  description?: string;
  placeholder: string;
  value: string;
  onChange: (id: string) => void;
  options: AccountOption[];
  /** Account types listed first, in this order; every other account stays selectable below. */
  preferredTypes?: string[];
  /** Ids already used by another field of the same form; they cannot be picked twice. */
  takenIds?: string[];
  error?: string;
  required?: boolean;
  loading?: boolean;
  disabled?: boolean;
};

const toItem = (option: AccountOption, takenIds: string[], value: string) => ({
  value: option.id,
  label: option.accountNumber ? `${option.accountNumber} · ${option.name}` : option.name,
  disabled: takenIds.includes(option.id) && option.id !== value,
});

/** Searchable account picker whose preferred account types come first. */
export function AccountSelect({
  label,
  description,
  placeholder,
  value,
  onChange,
  options,
  preferredTypes = [],
  takenIds = [],
  error,
  required,
  loading,
  disabled,
}: Readonly<AccountSelectProps>) {
  const types = [
    ...preferredTypes.filter((type) => options.some((option) => option.type === type)),
    ...[...new Set(options.map((option) => option.type))]
      .filter((type) => !preferredTypes.includes(type))
      .sort((a, b) => a.localeCompare(b)),
  ];

  const data = types.map((type) => ({
    group: type || '—',
    items: options.filter((option) => option.type === type).map((o) => toItem(o, takenIds, value)),
  }));

  return (
    <Select
      label={label}
      description={description}
      placeholder={placeholder}
      data={data}
      value={value || null}
      onChange={(next) => onChange(next ?? '')}
      error={error}
      withAsterisk={required}
      disabled={disabled || loading}
      searchable
      clearable
      size="sm"
      nothingFoundMessage="—"
      comboboxProps={{ withinPortal: true }}
    />
  );
}

export default AccountSelect;
