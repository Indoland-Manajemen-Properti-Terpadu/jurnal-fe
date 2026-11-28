import React from 'react';
import { Group, Paper, Select, SimpleGrid, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import type { ProfitLossComparisonPreset } from '@/module/reports/domain/profitLossPeriod';
import type { ReportPeriodDates } from '@/module/reports/presentation/hooks/useReportPeriod';

interface ProfitLossPeriodFiltersProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  period: ReportPeriodDates;
  onPeriodChange: (period: ReportPeriodDates) => void;
  comparisonPreset: ProfitLossComparisonPreset;
  onComparisonPresetChange: (preset: ProfitLossComparisonPreset) => void;
  customComparePeriod: ReportPeriodDates;
  onCustomComparePeriodChange: (period: ReportPeriodDates) => void;
  comparePeriod: ReportPeriodDates | null;
}

type DatePart = keyof ReportPeriodDates;

const DateRangeFields: React.FC<{
  label: string;
  value: ReportPeriodDates;
  disabled?: boolean;
  onChange: (part: DatePart, date: string) => void;
}> = ({ label, value, disabled = false, onChange }) => {
  const { t } = useTranslation('reports');
  const dateFormat = 'MM/DD/YYYY';

  return (
    <div>
      {label && (
        <Text fz="sm" c="dimmed" mb={6}>
          {label}
        </Text>
      )}
      <Group gap="xs" wrap="nowrap">
        <DatePickerInput
          type="default"
          size="sm"
          radius="md"
          valueFormat={dateFormat}
          leftSection={<IconCalendar size={15} />}
          value={value.startDate || null}
          disabled={disabled}
          aria-label={t('profitLoss.startDate')}
          onChange={(date) => date && onChange('startDate', date)}
          style={{ flex: 1, minWidth: 0 }}
        />
        <Text fz="xs" c="dimmed" aria-hidden>
          {t('profitLoss.periodUntil')}
        </Text>
        <DatePickerInput
          type="default"
          size="sm"
          radius="md"
          valueFormat={dateFormat}
          leftSection={<IconCalendar size={15} />}
          value={value.endDate || null}
          disabled={disabled}
          aria-label={t('profitLoss.endDate')}
          onChange={(date) => date && onChange('endDate', date)}
          style={{ flex: 1, minWidth: 0 }}
        />
      </Group>
    </div>
  );
};

export const ProfitLossPeriodFilters: React.FC<ProfitLossPeriodFiltersProps> = ({
  preset,
  onPresetChange,
  period,
  onPeriodChange,
  comparisonPreset,
  onComparisonPresetChange,
  customComparePeriod,
  onCustomComparePeriodChange,
  comparePeriod,
}) => {
  const { t } = useTranslation('reports');
  const periodOptions = [
    { value: 'this_month', label: t('profitLoss.periodThisMonth') },
    { value: 'last_month', label: t('profitLoss.periodLastMonth') },
    { value: 'this_quarter', label: t('profitLoss.periodThisQuarter') },
    { value: 'this_year', label: t('profitLoss.periodThisYear') },
    { value: 'custom', label: t('profitLoss.periodCustom') },
  ];
  const compareOptions = [
    { value: 'none', label: t('profitLoss.compareNone') },
    { value: 'previous_period', label: t('profitLoss.comparePreviousPeriod') },
    { value: 'same_period_last_year', label: t('profitLoss.compareSamePeriodLastYear') },
    { value: 'custom', label: t('profitLoss.compareCustom') },
  ];

  const changePeriod = (part: DatePart, date: string) => {
    const next = { ...period, [part]: date };
    if (next.startDate <= next.endDate) onPeriodChange(next);
  };
  const changeComparePeriod = (part: DatePart, date: string) => {
    const next = { ...customComparePeriod, [part]: date };
    onCustomComparePeriodChange(next);
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <div>
          <Select
            label={t('profitLoss.period')}
            size="sm"
            radius="md"
            data={periodOptions}
            value={preset}
            onChange={(value) => value && onPresetChange(value as PeriodPreset)}
            aria-label={t('profitLoss.period')}
          />
          <div style={{ marginTop: 'var(--jurnal-space-3)' }}>
            <DateRangeFields label="" value={period} onChange={changePeriod} />
          </div>
        </div>

        <div>
          <Select
            label={t('profitLoss.compareWith')}
            size="sm"
            radius="md"
            data={compareOptions}
            value={comparisonPreset}
            onChange={(value) =>
              value && onComparisonPresetChange(value as ProfitLossComparisonPreset)
            }
            aria-label={t('profitLoss.compareWith')}
          />
          <div style={{ marginTop: 'var(--jurnal-space-3)' }}>
            <DateRangeFields
              label=""
              value={
                comparisonPreset === 'custom'
                  ? customComparePeriod
                  : (comparePeriod ?? { startDate: '', endDate: '' })
              }
              disabled={comparisonPreset !== 'custom'}
              onChange={changeComparePeriod}
            />
          </div>
        </div>
      </SimpleGrid>
    </Paper>
  );
};
