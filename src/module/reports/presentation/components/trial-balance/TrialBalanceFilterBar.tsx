import React from 'react';
import { Group, Paper, Select, SimpleGrid, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';
import type { ReportPeriodDates } from '@/module/reports/presentation/hooks/useReportPeriod';
import { useTranslation } from '@/i18n';

interface TrialBalanceFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  period: ReportPeriodDates;
  onPeriodChange: (period: ReportPeriodDates) => void;
}

type DatePart = keyof ReportPeriodDates;

export const TrialBalanceFilterBar: React.FC<TrialBalanceFilterBarProps> = ({
  preset,
  onPresetChange,
  period,
  onPeriodChange,
}) => {
  const { t } = useTranslation('reports');
  const periodOptions: Array<{ value: PeriodPreset; label: string }> = [
    { value: 'this_month', label: t('trialBalance.periodThisMonth') },
    { value: 'last_month', label: t('trialBalance.periodLastMonth') },
    { value: 'this_quarter', label: t('trialBalance.periodThisQuarter') },
    { value: 'this_year', label: t('trialBalance.periodThisYear') },
    { value: 'custom', label: t('trialBalance.periodCustom') },
  ];

  const updateDate = (part: DatePart, date: string | null) => {
    if (!date) return;
    const next = { ...period, [part]: date };
    if (next.startDate > next.endDate) return;
    onPeriodChange(next);
    if (preset !== 'custom') onPresetChange('custom');
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="lg">
        <Select
          label={t('trialBalance.periodLabel')}
          size="sm"
          radius="md"
          data={periodOptions}
          value={preset}
          onChange={(value) => value && onPresetChange(value as PeriodPreset)}
          aria-label={t('trialBalance.periodLabel')}
        />
        <Group align="flex-end" gap="xs" wrap="nowrap">
          <DatePickerInput
            type="default"
            size="sm"
            radius="md"
            valueFormat="MM/DD/YYYY"
            leftSection={<IconCalendar size={15} />}
            value={period.startDate || null}
            aria-label={t('trialBalance.startDate')}
            onChange={(date) => updateDate('startDate', date)}
            style={{ flex: 1, minWidth: 0 }}
          />
          <Text fz="xs" c="dimmed" mb={8}>
            {t('trialBalance.periodUntil')}
          </Text>
          <DatePickerInput
            type="default"
            size="sm"
            radius="md"
            valueFormat="MM/DD/YYYY"
            leftSection={<IconCalendar size={15} />}
            value={period.endDate || null}
            aria-label={t('trialBalance.endDate')}
            onChange={(date) => updateDate('endDate', date)}
            style={{ flex: 1, minWidth: 0 }}
          />
        </Group>
      </SimpleGrid>
    </Paper>
  );
};
