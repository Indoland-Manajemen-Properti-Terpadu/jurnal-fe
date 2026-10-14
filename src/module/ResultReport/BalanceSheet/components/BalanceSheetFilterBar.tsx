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
  IconColumns,
  IconDownload,
  IconFileSpreadsheet,
  IconFileTypeCsv,
  IconFileTypePdf,
  IconFilter,
  IconLayoutRows,
  IconPrinter,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import type { BalanceSheetExportType, BalanceSheetQueryParams } from '../types/balanceSheet.types';
import type { PeriodPreset } from '../../utils/reportFormat';

interface BalanceSheetFilterBarProps {
  preset: PeriodPreset;
  onPresetChange: (preset: PeriodPreset) => void;
  draftPeriod: BalanceSheetQueryParams;
  onDraftPeriodChange: (period: BalanceSheetQueryParams) => void;
  onApplyPeriod: () => void;
  isFetching: boolean;
  onExport: (type: BalanceSheetExportType) => void;
  isExporting: boolean;
  viewMode: 'standard' | 'side_by_side';
  onViewModeChange: (mode: 'standard' | 'side_by_side') => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  hasData: boolean;
}

export const BalanceSheetFilterBar: React.FC<BalanceSheetFilterBarProps> = ({
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
  searchQuery,
  onSearchQueryChange,
  hasData,
}) => {
  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Stack gap="md">
        {/* Top toolbar: Presets & View Mode */}
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
              Layout:
            </Text>
            <SegmentedControl
              size="xs"
              radius="md"
              value={viewMode}
              onChange={(val) => onViewModeChange(val as 'standard' | 'side_by_side')}
              data={[
                {
                  label: (
                    <Group gap={6} wrap="nowrap">
                      <IconColumns size={14} />
                      <span>Berdampingan (Skontro)</span>
                    </Group>
                  ),
                  value: 'side_by_side',
                },
                {
                  label: (
                    <Group gap={6} wrap="nowrap">
                      <IconLayoutRows size={14} />
                      <span>Vertikal (Stafel)</span>
                    </Group>
                  ),
                  value: 'standard',
                },
              ]}
              color="primary"
            />
          </Group>
        </Group>

        {/* Bottom controls: Date inputs, search, and action buttons */}
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
              label="Per Tanggal (Sampai)"
              aria-label="Per Tanggal (Sampai)"
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

          <Group gap="sm" align="flex-end">
            <TextInput
              placeholder="Cari akun neraca..."
              size="sm"
              radius="md"
              leftSection={<IconSearch size={15} />}
              rightSection={
                searchQuery ? (
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => onSearchQueryChange('')}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                ) : null
              }
              value={searchQuery}
              onChange={(e) => onSearchQueryChange(e.currentTarget.value)}
              w={{ base: '100%', xs: 220 }}
            />

            <Tooltip label="Cetak Neraca">
              <ActionIcon
                variant="default"
                size="input-sm"
                radius="md"
                onClick={() => window.print()}
                disabled={!hasData}
                aria-label="Cetak Neraca"
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

