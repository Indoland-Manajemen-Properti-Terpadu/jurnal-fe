import React, { useEffect, useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Paper,
  SegmentedControl,
  Stack,
  Tooltip,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import {
  IconCalendar,
  IconChevronDown,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconPrinter,
  IconRefresh,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';

export type ReportExportType = 'pdf' | 'xlsx' | 'csv';

export interface ReportPeriodRange {
  startDate: string;
  endDate: string;
}

export interface ReportToolbarProps {
  /** The highlighted quick period. */
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  /** The dates being edited; they apply only after "Apply" (quick periods apply at once). */
  draftPeriod: ReportPeriodRange;
  onDraftPeriodChange: (period: ReportPeriodRange) => void;
  /** The dates the report currently shows; the Apply button appears when the draft differs. */
  appliedPeriod: ReportPeriodRange;
  onApplyPeriod: () => void;
  isFetching: boolean;
  /** Shows the export menu; leave it out for a report with no export. */
  onExport?: (type: ReportExportType) => void;
  isExporting?: boolean;
  /** Stops an export in progress. */
  onCancelExport?: () => void;
  onRefresh?: () => void;
  hasData: boolean;
  /** Search or other filters shown beside the dates. */
  extra?: React.ReactNode;
}

type RangeValue = [string | null, string | null];

const toRange = (period: ReportPeriodRange): RangeValue => [
  period.startDate || null,
  period.endDate || null,
];

/**
 * Period, filter and export controls shared by every report page. Row one holds the quick
 * periods and the page actions, row two the dates and any extra filters. The Apply button shows
 * only while the dates differ from what the report displays.
 */
export const ReportToolbar: React.FC<ReportToolbarProps> = ({
  preset,
  onPresetChange,
  draftPeriod,
  onDraftPeriodChange,
  appliedPeriod,
  onApplyPeriod,
  isFetching,
  onExport,
  isExporting = false,
  onCancelExport,
  onRefresh,
  hasData,
  extra,
}) => {
  const { t } = useTranslation('reports');

  // A range picker emits the first click alone; keep that half-chosen range out of the draft.
  const [pending, setPending] = useState<RangeValue>(() => toRange(draftPeriod));
  useEffect(() => {
    setPending(toRange(draftPeriod));
  }, [draftPeriod.startDate, draftPeriod.endDate]);

  const markCustom = () => {
    if (preset !== 'custom') onPresetChange('custom');
  };

  const changeRange = ([from, to]: RangeValue) => {
    setPending([from, to]);
    if (from && to) {
      onDraftPeriodChange({ startDate: from, endDate: to });
      markCustom();
    }
  };

  const isDirty =
    draftPeriod.startDate !== appliedPeriod.startDate ||
    draftPeriod.endDate !== appliedPeriod.endDate;

  const presets = [
    { label: t('common.thisMonthId'), value: 'this_month' },
    { label: t('common.lastMonthId'), value: 'last_month' },
    { label: t('common.thisQuarterId'), value: 'this_quarter' },
    { label: t('common.thisYearId'), value: 'this_year' },
    { label: t('common.customId'), value: 'custom' },
  ];

  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <SegmentedControl
            size="sm"
            radius="xl"
            value={preset}
            onChange={(value) => onPresetChange(value as PeriodPreset)}
            aria-label={t('common.periodLabel')}
            data={presets}
          />

          <Group gap="xs">
            {onRefresh && (
              <Tooltip label={t('common.refresh')}>
                <ActionIcon
                  variant="default"
                  size="input-sm"
                  radius="md"
                  onClick={onRefresh}
                  loading={isFetching}
                  aria-label={t('common.refresh')}
                >
                  <IconRefresh size={17} />
                </ActionIcon>
              </Tooltip>
            )}

            <Tooltip label={t('common.printReport')}>
              <ActionIcon
                variant="default"
                size="input-sm"
                radius="md"
                onClick={() => window.print()}
                disabled={!hasData}
                aria-label={t('common.printReport')}
              >
                <IconPrinter size={17} />
              </ActionIcon>
            </Tooltip>

            {isExporting && onCancelExport && (
              <Button size="sm" variant="subtle" color="gray" radius="md" onClick={onCancelExport}>
                {t('common.cancelExport')}
              </Button>
            )}

            {onExport && (
              <Menu position="bottom-end" shadow="md" width={200} withinPortal>
                <Menu.Target>
                  <Button
                    size="sm"
                    variant="default"
                    radius="md"
                    leftSection={<IconDownload size={16} />}
                    rightSection={<IconChevronDown size={14} />}
                    loading={isExporting}
                    disabled={!hasData || isFetching}
                  >
                    {t('common.export')}
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <Menu.Label>{t('common.chooseExportFormat')}</Menu.Label>
                  <Menu.Item
                    leftSection={<IconFileTypePdf size={16} />}
                    onClick={() => onExport('pdf')}
                  >
                    {t('common.formatPdf')}
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFileSpreadsheet size={16} />}
                    onClick={() => onExport('xlsx')}
                  >
                    {t('common.formatXlsx')}
                  </Menu.Item>
                  <Menu.Item
                    leftSection={<IconFileTypeCsv size={16} />}
                    onClick={() => onExport('csv')}
                  >
                    {t('common.formatCsv')}
                  </Menu.Item>
                </Menu.Dropdown>
              </Menu>
            )}
          </Group>
        </Group>

        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Group align="flex-end" gap="sm" wrap="wrap">
            <DatePickerInput
              type="range"
              label={t('common.dateRange')}
              placeholder={t('common.selectDateRange')}
              leftSection={<IconCalendar size={16} />}
              valueFormat="DD MMM YYYY"
              size="sm"
              radius="md"
              allowSingleDateInRange
              value={pending}
              onChange={changeRange}
              w={{ base: '100%', xs: 280 }}
            />
            {isDirty && (
              <Button
                size="sm"
                radius="md"
                onClick={onApplyPeriod}
                loading={isFetching}
                disabled={!draftPeriod.startDate || !draftPeriod.endDate}
              >
                {t('common.show')}
              </Button>
            )}
          </Group>

          {extra}
        </Group>
      </Stack>
    </Paper>
  );
};
