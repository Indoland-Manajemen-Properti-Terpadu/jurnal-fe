import { IconCalendar } from '@tabler/icons-react';
import { DatePickerInput, type DatePickerInputProps } from '@mantine/dates';

interface DateFieldProps extends Omit<
  DatePickerInputProps,
  'value' | 'onChange' | 'type' | 'valueFormat'
> {
  /** `YYYY-MM-DD`, or empty. */
  value: string;
  onChange: (value: string) => void;
}

/** Date input that reads and writes calendar days as `YYYY-MM-DD`. */
export const DateField = ({ value, onChange, ...rest }: Readonly<DateFieldProps>) => (
  <DatePickerInput
    radius="md"
    valueFormat="DD MMM YYYY"
    rightSection={<IconCalendar size={16} />}
    value={value || null}
    onChange={(next) => onChange(next ? String(next).slice(0, 10) : '')}
    {...rest}
  />
);
