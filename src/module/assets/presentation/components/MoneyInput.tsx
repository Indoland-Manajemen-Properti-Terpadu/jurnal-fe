import { NumberInput, type NumberInputProps } from '@mantine/core';

export type MoneyInputProps = Omit<NumberInputProps, 'value' | 'onChange'> & {
  value: number;
  onChange: (value: number) => void;
};

/**
 * Rupiah amount field. Zero shows as an empty field with an "Rp 0" placeholder, so typing starts
 * clean instead of after a leading zero; negatives, leading zeros and more than two decimals are
 * refused while typing.
 */
export function MoneyInput({ value, onChange, ...props }: Readonly<MoneyInputProps>) {
  return (
    <NumberInput
      thousandSeparator="."
      decimalSeparator=","
      prefix="Rp "
      placeholder="Rp 0"
      allowNegative={false}
      allowLeadingZeros={false}
      decimalScale={2}
      hideControls
      size="sm"
      {...props}
      value={value === 0 ? '' : value}
      onChange={(next) => onChange(typeof next === 'number' ? next : Number(next) || 0)}
    />
  );
}

export default MoneyInput;
