import { useEffect, useState } from 'react';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';

type Props = {
  /** `YYYY-MM-DD`. */
  from: string;
  to: string;
  maxDate?: string;
  'aria-label': string;
  onChange: (from: string, to: string) => void;
  w?: number | Record<string, number | string>;
};

const asDay = (value: unknown): string => (value ? String(value).slice(0, 10) : '');

/** One field for a period, as on the report pages; the filter changes once both ends are chosen. */
export function DateRangeField({
  from,
  to,
  maxDate,
  onChange,
  w,
  'aria-label': ariaLabel,
}: Readonly<Props>) {
  const [draft, setDraft] = useState<[string | null, string | null]>([from || null, to || null]);
  useEffect(() => setDraft([from || null, to || null]), [from, to]);

  return (
    <DatePickerInput
      type="range"
      aria-label={ariaLabel}
      radius="md"
      valueFormat="DD MMM YYYY"
      leftSection={<IconCalendar size={16} />}
      value={draft}
      maxDate={maxDate}
      allowSingleDateInRange
      onChange={(next) => {
        const start = asDay(next[0]);
        const end = asDay(next[1]);
        setDraft([start || null, end || null]);
        if (start && end) onChange(start, end);
      }}
      w={w}
    />
  );
}
