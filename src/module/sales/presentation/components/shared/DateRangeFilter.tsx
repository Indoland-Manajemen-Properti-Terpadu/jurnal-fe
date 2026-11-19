import { useEffect, useState } from 'react';
import { Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { DATE_PRESETS, presetRange, type DatePreset } from '@/module/sales/domain/saleDateRange';
import type { DateRange } from '@/module/sales/domain/saleListState';

interface DateRangeFilterProps {
  range: DateRange;
  onRange: (range: DateRange) => void;
}

const toIso = (value: unknown): string | null => (value ? String(value).slice(0, 10) : null);

/**
 * A period dropdown (today, this week, this month, this year, custom) in place of a bare date
 * picker. "Kustom" reveals the range picker; the other choices fill the range themselves.
 */
export function DateRangeFilter({ range, onRange }: Readonly<DateRangeFilterProps>) {
  const { t } = useTranslation('sales');
  const [preset, setPreset] = useState<DatePreset>(range[0] && range[1] ? 'custom' : 'all');

  // A reset from outside empties the range; the dropdown follows unless the user is picking custom dates.
  useEffect(() => {
    if (!range[0] && !range[1] && preset !== 'custom') setPreset('all');
  }, [range, preset]);

  const choose = (value: string | null) => {
    const next = (value as DatePreset) || 'all';
    setPreset(next);
    if (next !== 'custom') onRange(presetRange(next));
  };

  return (
    <>
      <Select
        aria-label={t('filter.period')}
        data={DATE_PRESETS.map((value) => ({ value, label: t(`filter.periods.${value}`) }))}
        value={preset}
        onChange={choose}
        allowDeselect={false}
        leftSection={<IconCalendar size={16} />}
        w={{ base: '100%', sm: 200 }}
      />
      {preset === 'custom' && (
        <DatePickerInput
          type="range"
          aria-label={t('filter.date')}
          placeholder={t('filter.datePlaceholder')}
          valueFormat="DD MMM YYYY"
          leftSection={<IconCalendar size={16} />}
          value={range}
          onChange={(value) => onRange([toIso(value[0]), toIso(value[1])])}
          clearable
          w={{ base: '100%', sm: 250 }}
        />
      )}
    </>
  );
}
