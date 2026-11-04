import { Select } from '@mantine/core';
import { formatCurrency } from '@/utils/formatCurrency';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';
import { defaultPocketCode } from '@/module/petty-cash/domain/pockets';
import { activePockets } from '@/module/petty-cash/domain/pettyCashView';

interface Props {
  pockets: FundPocket[];
  /** Chosen pocket code; empty means the fund's default pocket. */
  value: string | null;
  onChange: (code: string) => void;
  label: string;
  description?: string;
  error?: string;
  /** Show the balance next to each pocket (when money leaves the pocket). */
  showBalance?: boolean;
}

/**
 * Chooses a pocket of the fund. A fund with a single active pocket has nothing to choose, so the
 * field is not shown and the backend uses the cash box.
 */
export function PocketSelect({
  pockets,
  value,
  onChange,
  label,
  description,
  error,
  showBalance = true,
}: Readonly<Props>) {
  const offered = activePockets(pockets);
  if (offered.length < 2) return null;

  return (
    <Select
      label={label}
      description={description}
      error={error}
      data={offered.map((pocket) => ({
        value: pocket.code,
        label: showBalance
          ? `${pocket.name} · ${formatCurrency(pocket.balance, false)}`
          : pocket.name,
      }))}
      value={value || defaultPocketCode(pockets)}
      onChange={(code) => code && onChange(code)}
      allowDeselect={false}
    />
  );
}
