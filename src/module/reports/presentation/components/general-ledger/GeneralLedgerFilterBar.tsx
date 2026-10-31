import React from 'react';
import {
  ActionIcon,
  Box,
  Button,
  Group,
  Menu,
  Paper,
  SegmentedControl,
  Stack,
  Text,
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
  IconFilter,
  IconListDetails,
  IconPrinter,
  IconRefresh,
  IconTable,
} from '@tabler/icons-react';
import type {
  GeneralLedgerExportType,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import type { PeriodPreset } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';
interface GeneralLedgerFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: ReportPeriod;
  onDraftPeriodChange: (period: ReportPeriod) => void;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onExport: (type: GeneralLedgerExportType) => void;
  isExporting: boolean;
  viewMode: 'master_detail' | 'consolidated';
  onViewModeChange: (mode: 'master_detail' | 'consolidated') => void;
  hasData: boolean;
}

export const GeneralLedgerFilterBar: React.FC<GeneralLedgerFilterBarProps> = ({
  preset,
  onPresetChange,
  draftPeriod,
  onDraftPeriodChange,
  onApplyPeriod,
  isFetching,
  onExport,
  isExporting,
  viewMode,
  onViewModeChange,
  hasData,
}) => {
  const { t } = useTranslation('reports');
  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Stack gap="md">
        {/* Top bar: Presets & View Mode Toggle */}
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" wrap="wrap">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mr={4}>
              {t('common.quickPeriod')}
            </Text>
            <SegmentedControl
              size="xs"
              radius="md"
              value={preset}
              onChange={(val) => onPresetChange(val as PeriodPreset)}
              data={[
                { label: t('common.thisMonthId'), value: 'this_month' },
                { label: t('common.lastMonthId'), value: 'last_month' },
                { label: t('common.thisQuarterId'), value: 'this_quarter' },
                { label: t('common.thisYearId'), value: 'this_year' },
                { label: t('common.customId'), value: 'custom' },
              ]}
              color="primary"
            />
          </Group>

          <Group gap="xs">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mr={4}>
              {t('generalLedger.viewLabel')}
            </Text>
            <SegmentedControl
              size="xs"
              radius="md"
              value={viewMode}
              onChange={(val) => onViewModeChange(val as 'master_detail' | 'consolidated')}
              data={[
                {
                  label: (
                    <Group gap={6} wrap="nowrap">
                      <IconListDetails size={14} />
                      <span>{t('generalLedger.viewFocus')}</span>
                    </Group>
                  ),
                  value: 'master_detail',
                },
                {
                  label: (
                    <Group gap={6} wrap="nowrap">
                      <IconTable size={14} />
                      <span>{t('generalLedger.viewAll')}</span>
                    </Group>
                  ),
                  value: 'consolidated',
                },
              ]}
              color="primary"
            />
          </Group>
        </Group>

        {/* Date pickers + Actions */}
        <Group justify="space-between" align="flex-end" wrap="wrap" gap="md">
          <Group align="flex-end" gap="sm" wrap="wrap">
            <TextInput
              type="date"
              size="sm"
              label={t('common.fromDate')}
              aria-label={t('common.fromDate')}
              leftSection={<IconCalendar size={16} />}
              value={draftPeriod.startDate}
              onChange={(e) =>
                onDraftPeriodChange({ ...draftPeriod, startDate: e.currentTarget.value })
              }
              w={{ base: '100%', xs: 160 }}
            />
            <TextInput
              type="date"
              size="sm"
              label={t('common.toDate')}
              aria-label={t('common.toDate')}
              leftSection={<IconCalendar size={16} />}
              value={draftPeriod.endDate}
              onChange={(e) =>
                onDraftPeriodChange({ ...draftPeriod, endDate: e.currentTarget.value })
              }
              w={{ base: '100%', xs: 160 }}
            />
            <Button
              color="primary"
              size="sm"
              radius="md"
              onClick={onApplyPeriod}
              loading={isFetching}
              leftSection={<IconFilter size={16} />}
            >
              {t('common.show')}
            </Button>
          </Group>

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

            <Menu position="bottom-end" shadow="md" width={180} withinPortal>
              <Menu.Target>
                <Button
                  variant="light"
                  color="primary"
                  size="sm"
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
                  leftSection={<IconFileTypePdf size={16} color="red" />}
                  onClick={() => onExport('pdf')}
                >
                  {t('common.formatPdf')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileSpreadsheet size={16} color="green" />}
                  onClick={() => onExport('xlsx')}
                >
                  {t('common.formatXlsx')}
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={16} color="gray" />}
                  onClick={() => onExport('csv')}
                >
                  {t('common.formatCsv')}
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
};
