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
import type { GeneralLedgerExportType, ReportPeriod } from '../types/generalLedger.types';
import type { PeriodPreset } from '../../utils/reportFormat';

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
  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Stack gap="md">
        {/* Top bar: Presets & View Mode Toggle */}
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" wrap="wrap">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mr={4}>
              Periode Cepat:
            </Text>
            <SegmentedControl
              size="xs"
              radius="md"
              value={preset}
              onChange={(val) => onPresetChange(val as PeriodPreset)}
              data={[
                { label: 'Bulan Ini', value: 'this_month' },
                { label: 'Bulan Lalu', value: 'last_month' },
                { label: 'Kuartal Ini', value: 'this_quarter' },
                { label: 'Tahun Ini', value: 'this_year' },
                { label: 'Kustom', value: 'custom' },
              ]}
              color="primary"
            />
          </Group>

          <Group gap="xs">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" mr={4}>
              Tampilan:
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
                      <span>Fokus Per Akun</span>
                    </Group>
                  ),
                  value: 'master_detail',
                },
                {
                  label: (
                    <Group gap={6} wrap="nowrap">
                      <IconTable size={14} />
                      <span>Semua Akun</span>
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
              label="Dari Tanggal"
              aria-label="Dari Tanggal"
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
              label="Sampai Tanggal"
              aria-label="Sampai Tanggal"
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
              Tampilkan
            </Button>
          </Group>

          <Group gap="xs">
            <Tooltip label="Cetak Laporan">
              <ActionIcon
                variant="default"
                size="input-sm"
                radius="md"
                onClick={() => window.print()}
                disabled={!hasData}
                aria-label="Cetak Laporan"
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
                  Ekspor
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Pilih Format Ekspor</Menu.Label>
                <Menu.Item
                  leftSection={<IconFileTypePdf size={16} color="red" />}
                  onClick={() => onExport('pdf')}
                >
                  PDF Document (.pdf)
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileSpreadsheet size={16} color="green" />}
                  onClick={() => onExport('xlsx')}
                >
                  Excel Spreadsheet (.xlsx)
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconFileTypeCsv size={16} color="gray" />}
                  onClick={() => onExport('csv')}
                >
                  CSV Data (.csv)
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </Stack>
    </Paper>
  );
};

