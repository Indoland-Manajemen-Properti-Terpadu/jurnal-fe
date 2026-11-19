import { useEffect, useState } from 'react';
import { Popover, Select } from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { DATE_PRESETS, presetRange, type DatePreset } from '@/module/sales/domain/saleDateRange';
import { formatDate } from '@/module/sales/domain/saleFormat';
import type { DateRange } from '@/module/sales/domain/saleListState';

interface DateRangeFilterProps {
  range: DateRange;
  onRange: (range: DateRange) => void;
}

const toIso = (value: unknown): string | null => (value ? String(value).slice(0, 10) : null);

/**
 * One control for the period: today, this week, this month, this year or custom. Choosing
 * "Kustom" opens the calendar right under the same field, and the chosen days replace its label.
 */
export function DateRangeFilter({ range, onRange }: Readonly<DateRangeFilterProps>) {
  const { t } = useTranslation('sales');
  const [preset, setPreset] = useState<DatePreset>(range[0] && range[1] ? 'custom' : 'all');
  const [pickerOpen, setPickerOpen] = useState(false);

  // A reset from outside empties the range; the field follows.
  useEffect(() => {
    if (!range[0] && !range[1] && !pickerOpen && preset === 'custom') setPreset('all');
  }, [range, pickerOpen, preset]);

  const labelOf = (value: DatePreset) =>
    value === 'custom' && range[0] && range[1]
      ? `${formatDate(range[0])} – ${formatDate(range[1])}`
      : t(`filter.periods.${value}`);

  const choose = (value: string | null) => {
    const next = (value as DatePreset) || 'all';
    setPreset(next);
    if (next !== 'custom') onRange(presetRange(next));
  };

  return (
    <Popover
      opened={pickerOpen}
      onChange={setPickerOpen}
      position="bottom-start"
      shadow="md"
      radius="md"
    >
      <Popover.Target>
        <div>
          <Select
            aria-label={t('filter.period')}
            data={DATE_PRESETS.map((value) => ({ value, label: labelOf(value) }))}
            value={preset}
            onChange={choose}
            // Picking "Kustom" again still opens the calendar, even though the value is unchanged.
            onOptionSubmit={(value) => {
              if (value === 'custom') setPickerOpen(true);
            }}
            allowDeselect={false}
            leftSection={<IconCalendar size={16} />}
            w={{ base: '100%', sm: 250 }}
          />
        </div>
      </Popover.Target>
      <Popover.Dropdown>
        <DatePicker
          type="range"
          value={range}
          onChange={(value) => {
            onRange([toIso(value[0]), toIso(value[1])]);
            if (value[0] && value[1]) setPickerOpen(false);
          }}
        />
      </Popover.Dropdown>
    </Popover>
  );
}
