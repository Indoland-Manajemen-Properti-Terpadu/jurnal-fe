import React from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Menu,
  Paper,
  SegmentedControl,
  Stack,
  TextInput,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendar,
  IconChevronDown,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconPrinter,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';

export type ReportExportType = 'pdf' | 'xlsx' | 'csv';

export interface ReportPeriodRange {
  startDate: string;
  endDate: string;
}

interface ReportToolbarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: ReportPeriodRange;
  onDraftPeriodChange: (period: ReportPeriodRange) => void;
  onApplyPeriod: () => void;
  isFetching: boolean;
  /** Label of the end date: "Sampai Tanggal" for a period, "Per Tanggal" for a position report. */
  endDateLabel?: string;
  onExport: (type: ReportExportType) => void;
  isExporting: boolean;
  /** Stops an export in progress. */
  onCancelExport?: () => void;
  hasData: boolean;
  /** View switch or search shown next to the dates. */
  extra?: React.ReactNode;
}

/** Period, view and export controls shared by the report pages. */
export const ReportToolbar: React.FC<ReportToolbarProps> = ({
  preset,
  onPresetChange,
  draftPeriod,
  onDraftPeriodChange,
  onApplyPeriod,
  isFetching,
  endDateLabel,
  onExport,
  isExporting,
  onCancelExport,
  hasData,
  extra,
}) => {
  const { t } = useTranslation('reports');

  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <SegmentedControl
            radius="xl"
            value={preset}
            onChange={(value) => onPresetChange(value as PeriodPreset)}
            aria-label={t('common.periodLabel')}
            data={[
              { label: t('common.thisMonthId'), value: 'this_month' },
              { label: t('common.lastMonthId'), value: 'last_month' },
              { label: t('common.thisQuarterId'), value: 'this_quarter' },
              { label: t('common.thisYearId'), value: 'this_year' },
              { label: t('common.customId'), value: 'custom' },
            ]}
          />

          <Group gap="xs">
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
              <Button variant="subtle" color="gray" radius="md" onClick={onCancelExport}>
                {t('common.cancelExport')}
              </Button>
            )}

            <Menu position="bottom-end" shadow="md" width={200} withinPortal>
              <Menu.Target>
                <Button
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
          </Group>
        </Group>

        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput
              type="date"
              label={t('common.fromDate')}
              leftSection={<IconCalendar size={16} />}
              value={draftPeriod.startDate}
              onChange={(event) =>
                onDraftPeriodChange({ ...draftPeriod, startDate: event.currentTarget.value })
              }
              w={{ base: '100%', xs: 170 }}
            />
            <TextInput
              type="date"
              label={endDateLabel ?? t('common.toDate')}
              leftSection={<IconCalendar size={16} />}
              value={draftPeriod.endDate}
              onChange={(event) =>
                onDraftPeriodChange({ ...draftPeriod, endDate: event.currentTarget.value })
              }
              w={{ base: '100%', xs: 170 }}
            />
            <Button
              variant="light"
              color="primary"
              radius="md"
              onClick={onApplyPeriod}
              loading={isFetching}
            >
              {t('common.show')}
            </Button>
          </Group>

          {extra}
        </Group>
      </Stack>
    </Paper>
  );
};
