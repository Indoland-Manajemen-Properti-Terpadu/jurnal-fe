import { Group, Paper, Select, SimpleGrid, Text, TextInput } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import type { BalanceSheetComparison } from '@/module/reports/domain/balanceSheet.types';
import type { BalanceSheetPreset } from '@/module/reports/presentation/hooks/useBalanceSheet';
import type { ReportPeriod } from '@/module/reports/domain/generalLedger.types';
import { useTranslation } from '@/i18n';
import classes from './BalanceSheet.module.css';

interface BalanceSheetFilterBarProps {
  preset: BalanceSheetPreset;
  onPresetChange: (preset: BalanceSheetPreset) => void;
  period: ReportPeriod;
  onPeriodChange: (period: ReportPeriod) => void;
  comparison: BalanceSheetComparison;
  onComparisonChange: (value: BalanceSheetComparison) => void;
  customComparePeriod: ReportPeriod;
  onCustomComparePeriodChange: (period: ReportPeriod) => void;
  comparePeriod: ReportPeriod | null;
}

type DatePart = keyof ReportPeriod;

const DateRangeFields = ({
  label,
  value,
  disabled = false,
  onChange,
  startLabel,
  endLabel,
  untilLabel,
}: {
  label: string;
  value: ReportPeriod;
  disabled?: boolean;
  onChange: (part: DatePart, value: string) => void;
  startLabel: string;
  endLabel: string;
  untilLabel: string;
}) => (
  <div>
    {label && (
      <Text fz="sm" c="dimmed" mb={6}>
        {label}
      </Text>
    )}
    <Group gap="xs" wrap="nowrap">
      <TextInput
        type="date"
        size="sm"
        radius="md"
        leftSection={<IconCalendar size={15} />}
        value={value.startDate}
        disabled={disabled}
        aria-label={startLabel}
        onChange={(event) =>
          event.currentTarget.value && onChange('startDate', event.currentTarget.value)
        }
        style={{ flex: 1, minWidth: 0 }}
      />
      <Text fz="xs" c="dimmed" aria-hidden>
        {untilLabel}
      </Text>
      <TextInput
        type="date"
        size="sm"
        radius="md"
        leftSection={<IconCalendar size={15} />}
        value={value.endDate}
        disabled={disabled}
        aria-label={endLabel}
        onChange={(event) =>
          event.currentTarget.value && onChange('endDate', event.currentTarget.value)
        }
        style={{ flex: 1, minWidth: 0 }}
      />
    </Group>
  </div>
);

export const BalanceSheetFilterBar: React.FC<BalanceSheetFilterBarProps> = ({
  preset,
  onPresetChange,
  period,
  onPeriodChange,
  comparison,
  onComparisonChange,
  customComparePeriod,
  onCustomComparePeriodChange,
  comparePeriod,
}) => {
  const { t } = useTranslation('reports');
  const periodOptions = [
    { value: 'this_month', label: t('balanceSheet.periodThisMonth') },
    { value: 'last_month', label: t('balanceSheet.periodLastMonth') },
    { value: 'this_quarter', label: t('balanceSheet.periodThisQuarter') },
    { value: 'this_year', label: t('balanceSheet.periodThisYear') },
    { value: 'last_year', label: t('balanceSheet.periodLastYear') },
    { value: 'custom', label: t('balanceSheet.periodCustom') },
  ];
  const compareOptions = [
    { value: 'none', label: t('balanceSheet.compareNone') },
    { value: 'previous_period', label: t('balanceSheet.comparePrevious') },
    { value: 'same_period_last_year', label: t('balanceSheet.compareLastYear') },
    { value: 'custom', label: t('balanceSheet.compareCustom') },
  ];
  const changePeriod = (part: DatePart, date: string) => {
    const next = { ...period, [part]: date };
    if (next.startDate > next.endDate) {
      next[part === 'startDate' ? 'endDate' : 'startDate'] = date;
    }
    onPeriodChange(next);
  };
  const changeComparePeriod = (part: DatePart, date: string) => {
    const next = { ...(comparePeriod ?? customComparePeriod), [part]: date };
    if (!next.startDate || !next.endDate || next.startDate > next.endDate) {
      next[part === 'startDate' ? 'endDate' : 'startDate'] = date;
    }
    onCustomComparePeriodChange(next);
  };

  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        <div>
          <Select
            label={t('balanceSheet.period')}
            size="sm"
            radius="md"
            data={periodOptions}
            value={preset}
            onChange={(value) => value && onPresetChange(value as BalanceSheetPreset)}
            aria-label={t('balanceSheet.period')}
          />
          <div className={classes.dateFields}>
            <DateRangeFields
              label=""
              value={period}
              onChange={changePeriod}
              startLabel={t('balanceSheet.startDate')}
              endLabel={t('balanceSheet.endDate')}
              untilLabel={t('balanceSheet.periodUntil')}
            />
          </div>
        </div>
        <div>
          <Select
            label={t('balanceSheet.compareLabel')}
            size="sm"
            radius="md"
            data={compareOptions}
            value={comparison}
            onChange={(value) => value && onComparisonChange(value as BalanceSheetComparison)}
            aria-label={t('balanceSheet.compareLabel')}
          />
          <div className={classes.dateFields}>
            <DateRangeFields
              label=""
              value={
                comparison === 'custom'
                  ? customComparePeriod
                  : (comparePeriod ?? { startDate: '', endDate: '' })
              }
              disabled={comparison === 'none'}
              onChange={changeComparePeriod}
              startLabel={t('balanceSheet.compareStartDate')}
              endLabel={t('balanceSheet.compareEndDate')}
              untilLabel={t('balanceSheet.periodUntil')}
            />
          </div>
        </div>
      </SimpleGrid>
    </Paper>
  );
};
