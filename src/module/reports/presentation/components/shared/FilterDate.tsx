import React, { useState, useEffect } from 'react';
import { Grid, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconChevronDown } from '@tabler/icons-react';
import { format, startOfMonth, startOfWeek, subDays } from 'date-fns';

import { useTranslation } from '@/i18n';
import { usePeriodOptions } from '@/module/reports/presentation/hooks/usePeriodOptions';

interface FilterDateProps {
  onFilterChange: (fromDate: string | undefined, toDate: string | undefined) => void;
}

const FilterDate: React.FC<FilterDateProps> = ({ onFilterChange }) => {
  const { t } = useTranslation('reports');
  const periodOptions = usePeriodOptions();
  const initialFromDate = format(new Date('2024-01-01'), 'yyyy-MM-dd');
  const initialToDate = format(new Date(), 'yyyy-MM-dd');

  const [value, setValue] = useState<[string | null, string | null]>([
    initialFromDate,
    initialToDate,
  ]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('All Period');

  useEffect(() => {
    const [fromDate, toDate] = value;
    const formattedFromDate = fromDate ? format(new Date(fromDate), 'yyyy-MM-dd') : undefined;
    const formattedToDate = toDate ? format(new Date(toDate), 'yyyy-MM-dd') : undefined;
    onFilterChange(formattedFromDate, formattedToDate);
  }, [value, onFilterChange]);

  const handlePeriodChange = (period: string | null) => {
    if (!period) return; // Prevent setting null values

    setSelectedPeriod(period);

    let newFromDate: string | null = null;
    let newToDate: string | null = format(new Date(), 'yyyy-MM-dd');

    switch (period) {
      case 'Today':
        newFromDate = format(new Date(), 'yyyy-MM-dd');
        newToDate = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'Yesterday':
        newFromDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        newToDate = format(subDays(new Date(), 1), 'yyyy-MM-dd');
        break;
      case 'This Week':
        newFromDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
        newToDate = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'This Month':
        newFromDate = format(startOfMonth(new Date()), 'yyyy-MM-dd');
        newToDate = format(new Date(), 'yyyy-MM-dd');
        break;
      case 'This Year':
        newFromDate = format(new Date(new Date().getFullYear(), 0, 1), 'yyyy-MM-dd');
        newToDate = format(new Date(), 'yyyy-MM-dd');
        break;
      default:
        newFromDate = initialFromDate;
        newToDate = initialToDate;
    }

    setValue([newFromDate, newToDate]);
  };

  return (
    <Grid columns={24} gutter="sm" style={{ flexGrow: 1 }}>
      <Grid.Col span={8}>
        <DatePickerInput
          type="range"
          placeholder={t('common.selectDateRange')}
          value={value}
          valueFormat="DD/MM/YYYY"
          onChange={setValue}
          size="xs"
          highlightToday
          clearable
          rightSection={!value ? <IconCalendar size={16} /> : null}
          maxDate={new Date()}
        />
      </Grid.Col>

      <Grid.Col span={8}>
        <Select
          value={selectedPeriod}
          onChange={handlePeriodChange}
          checkIconPosition="right"
          rightSection={<IconChevronDown size={16} />}
          data={periodOptions}
          placeholder={t('common.selectPeriod')}
          size="xs"
        />
      </Grid.Col>
    </Grid>
  );
};

export default FilterDate;
