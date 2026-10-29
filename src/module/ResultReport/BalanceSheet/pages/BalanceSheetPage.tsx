import React from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Skeleton,
  Stack,
  Text,
} from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconScale } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useBalanceSheet } from '../hooks/useBalanceSheet';
import { BalanceSheetFilterBar } from '../components/BalanceSheetFilterBar';
import { BalanceSheetSummaryCards } from '../components/BalanceSheetSummaryCards';
import { BalanceSheetLayoutViews } from '../components/BalanceSheetLayoutViews';

export default function BalanceSheetPage() {
  const balanceSheet = useBalanceSheet();

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Module Header */}
          <ModuleHeader
            icon={IconScale}
            title="Laporan Neraca Keuangan (Balance Sheet)"
            description="Pantau posisi aktiva dan pasiva perusahaan per tanggal laporan. Menyajikan rincian aset lancar, aset tetap, kewajiban, dan ekuitas modal."
            breadcrumbs={[
              { label: 'Laporan Keuangan', to: routes.resultReport.main },
              { label: 'Neraca' },
            ]}
          />

          {/* Filter Bar with Presets, Date Pickers, Search & Layout Switcher */}
          <BalanceSheetFilterBar
            preset={balanceSheet.preset}
            onPresetChange={balanceSheet.handlePresetChange}
            draftPeriod={balanceSheet.draftPeriod}
            onDraftPeriodChange={balanceSheet.setDraftPeriod}
            onApplyPeriod={balanceSheet.handleApplyCustomPeriod}
            isFetching={balanceSheet.query.isFetching}
            onExport={(type) => balanceSheet.exportMutation.mutate(type)}
            isExporting={balanceSheet.exportMutation.isPending}
            viewMode={balanceSheet.viewMode}
            onViewModeChange={balanceSheet.setViewMode}
            searchQuery={balanceSheet.searchQuery}
            onSearchQueryChange={balanceSheet.setSearchQuery}
            hasData={Boolean(balanceSheet.data)}
          />

          {/* Loading Skeleton */}
          {balanceSheet.query.isPending && (
            <Stack gap="md">
              <Skeleton height={110} radius="lg" />
              <Grid gutter="lg">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Skeleton height={420} radius="lg" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Skeleton height={420} radius="lg" />
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {/* Error State */}
          {balanceSheet.query.isError && (
            <Alert
              color="red"
              title="Gagal Memuat Laporan Neraca"
              icon={<IconAlertTriangle size={20} />}
              radius="lg"
            >
              <Group justify="space-between" align="center" gap="sm">
                <Text size="sm">{balanceSheet.query.error.message}</Text>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => balanceSheet.query.refetch()}
                >
                  Coba Lagi
                </Button>
              </Group>
            </Alert>
          )}

          {/* Success Content */}
          {balanceSheet.data && (
            <>
              {/* Summary KPI Cards & Balance Equation Status */}
              <BalanceSheetSummaryCards data={balanceSheet.data} />

              {/* Main Dual Layout Views (Side-by-side or Vertical) */}
              <BalanceSheetLayoutViews
                data={balanceSheet.data}
                viewMode={balanceSheet.viewMode}
                filteredCurrentAssets={balanceSheet.filteredCurrentAssets}
                filteredNonCurrentAssets={balanceSheet.filteredNonCurrentAssets}
                filteredDepreciation={balanceSheet.filteredDepreciation}
                filteredCurrentLiabilities={balanceSheet.filteredCurrentLiabilities}
                filteredNonCurrentLiabilities={balanceSheet.filteredNonCurrentLiabilities}
                filteredAllLiabilities={balanceSheet.filteredAllLiabilities}
                filteredEquity={balanceSheet.filteredEquity}
              />
            </>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

