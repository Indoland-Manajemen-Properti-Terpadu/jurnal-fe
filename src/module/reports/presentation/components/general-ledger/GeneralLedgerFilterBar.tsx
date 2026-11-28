import { Group, Paper, Select, Text } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import type { GeneralLedgerPreset } from '@/module/reports/presentation/hooks/useGeneralLedger';
import classes from './GeneralLedger.module.css';

interface Props {
  preset: GeneralLedgerPreset;
  onPresetChange: (preset: GeneralLedgerPreset) => void;
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
}

export function GeneralLedgerFilterBar({ preset, onPresetChange, period, onPeriodChange }: Props) {
  const { t } = useTranslation('reports');
  const options: { value: GeneralLedgerPreset; label: string }[] = [
    { value: 'this_month', label: t('generalLedger.periodThisMonth') },
    { value: 'last_month', label: t('generalLedger.periodLastMonth') },
    { value: 'this_quarter', label: t('generalLedger.periodThisQuarter') },
    { value: 'this_year', label: t('generalLedger.periodThisYear') },
    { value: 'last_year', label: t('generalLedger.periodLastYear') },
    { value: 'custom', label: t('generalLedger.periodCustom') },
  ];
  const changeDate = (part: keyof ReportPeriod, value: string | null) => {
    if (value) onPeriodChange({ ...period, [part]: value });
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white" className={classes.screenOnly}>
      <div className={classes.periodFields}>
        <Select
          label={t('generalLedger.period')}
          data={options}
          value={preset}
          onChange={(value) => value && onPresetChange(value as GeneralLedgerPreset)}
          size="sm"
          radius="md"
        />
        <Group gap="xs" wrap="nowrap">
          <DatePickerInput
            type="default"
            size="sm"
            radius="md"
            valueFormat="MM/DD/YYYY"
            leftSection={<IconCalendar size={15} />}
            aria-label={t('generalLedger.startDate')}
            value={period.startDate}
            onChange={(value) => changeDate('startDate', value)}
            className={classes.dateField}
          />
          <Text fz="xs" c="dimmed">
            {t('generalLedger.until')}
          </Text>
          <DatePickerInput
            type="default"
            size="sm"
            radius="md"
            valueFormat="MM/DD/YYYY"
            leftSection={<IconCalendar size={15} />}
            aria-label={t('generalLedger.endDate')}
            value={period.endDate}
            onChange={(value) => changeDate('endDate', value)}
            className={classes.dateField}
          />
        </Group>
      </div>
    </Paper>
  );
}
