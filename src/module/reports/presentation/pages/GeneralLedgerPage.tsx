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
import { IconAlertTriangle, IconBook2, IconRefresh } from '@tabler/icons-react';
import AppShellLayout from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useGeneralLedger } from '@/module/reports/presentation/hooks/useGeneralLedger';
import { GeneralLedgerFilterBar } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerFilterBar';
import { GeneralLedgerSummaryCards } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerSummaryCards';
import { GeneralLedgerAccountSidebar } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerAccountSidebar';
import { GeneralLedgerAccountDetail } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerAccountDetail';
import { GeneralLedgerConsolidatedTable } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerConsolidatedTable';

export default function GeneralLedgerPage() {
  const ledger = useGeneralLedger();

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Module Header */}
          <ModuleHeader
            icon={IconBook2}
            title="Buku Besar (General Ledger)"
            description="Pantau seluruh mutasi debit, kredit, dan saldo berjalan akun keuangan perusahaan secara terperinci dalam periode pembukuan."
            breadcrumbs={[
              { label: 'Laporan Keuangan', to: routes.resultReport.main },
              { label: 'Buku Besar' },
            ]}
          />

          {/* Filter Bar with Date Range, Presets & View Modes */}
          <GeneralLedgerFilterBar
            preset={ledger.preset}
            onPresetChange={ledger.handlePresetChange}
            draftPeriod={ledger.draftPeriod}
            onDraftPeriodChange={ledger.setDraftPeriod}
            onApplyPeriod={ledger.handleApplyCustomPeriod}
            isFetching={ledger.query.isFetching}
            onExport={(type) => ledger.exportMutation.mutate(type)}
            isExporting={ledger.exportMutation.isPending}
            viewMode={ledger.viewMode}
            onViewModeChange={ledger.setViewMode}
            hasData={Boolean(ledger.query.data && ledger.accounts.length > 0)}
          />

          {/* Loading Skeleton */}
          {ledger.query.isPending && (
            <Stack gap="md">
              <Skeleton height={110} radius="lg" />
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Skeleton height={500} radius="lg" />
                </Grid.Col>
                <Grid.Col span={{ base: 12, md: 8 }}>
                  <Skeleton height={500} radius="lg" />
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {/* Error State */}
          {ledger.query.isError && (
            <Alert
              color="red"
              title="Gagal Memuat Laporan Buku Besar"
              icon={<IconAlertTriangle size={20} />}
              radius="lg"
            >
              <Group justify="space-between" align="center" gap="sm">
                <Text size="sm">{ledger.query.error.message}</Text>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => ledger.query.refetch()}
                >
                  Coba Lagi
                </Button>
              </Group>
            </Alert>
          )}

          {/* Success Content */}
          {ledger.query.data && (
            <>
              {/* Summary Metric Cards */}
              <GeneralLedgerSummaryCards
                report={ledger.query.data}
                period={ledger.period}
                totalTransactions={ledger.totalTransactionsCount}
                isBalanced={ledger.isBalanced}
              />

              {ledger.accounts.length === 0 ? (
                <Paper withBorder radius="lg" p="xl" bg="white" shadow="xs">
                  <EmptyState
                    title="Tidak Ada Akun Pada Periode Ini"
                    description="Belum ada transaksi atau saldo aktif pada rentang tanggal yang dipilih. Silakan pilih periode tanggal lain."
                    py={60}
                  />
                </Paper>
              ) : ledger.viewMode === 'master_detail' ? (
                /* Master-Detail View Mode */
                <Grid gutter="md" align="flex-start">
                  <Grid.Col span={{ base: 12, md: 4, lg: 3.5 }}>
                    <GeneralLedgerAccountSidebar
                      accounts={ledger.filteredAccounts}
                      selectedAccountId={ledger.selectedAccount?.id ?? null}
                      onSelectAccount={ledger.setSelectedAccountId}
                      search={ledger.accountSearch}
                      onSearchChange={ledger.setAccountSearch}
                      totalCount={ledger.accounts.length}
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, md: 8, lg: 8.5 }}>
                    <GeneralLedgerAccountDetail
                      account={ledger.selectedAccount}
                      transactions={ledger.accountTransactions}
                      transactionSearch={ledger.transactionSearch}
                      onTransactionSearchChange={ledger.setTransactionSearch}
                      transactionSort={ledger.transactionSort}
                      onTransactionSortChange={ledger.setTransactionSort}
                    />
                  </Grid.Col>
                </Grid>
              ) : (
                /* Consolidated View Mode */
                <GeneralLedgerConsolidatedTable
                  accounts={ledger.accounts}
                  onSelectAccount={(accId) => {
                    ledger.setSelectedAccountId(accId);
                    ledger.setViewMode('master_detail');
                  }}
                />
              )}
            </>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}

