import React from 'react';
import { Alert, Box, Button, Grid, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconBook2, IconRefresh } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { useGeneralLedger } from '@/module/reports/presentation/hooks/useGeneralLedger';
import { ReportBackButton } from '@/module/reports/presentation/components/shared/ReportBackButton';
import { GeneralLedgerFilterBar } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerFilterBar';
import { GeneralLedgerSummaryCards } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerSummaryCards';
import { GeneralLedgerTable } from '@/module/reports/presentation/components/general-ledger/GeneralLedgerTable';

import { useTranslation } from '@/i18n';
import { ReportPrecisionProvider } from '@/module/reports/presentation/hooks/useReportPrecision';

export default function GeneralLedgerPage() {
  const { t } = useTranslation('reports');
  const ledger = useGeneralLedger();

  return (
    <AppShellLayout>
      <ReportPrecisionProvider precision={ledger.query.data?.precision}>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            {/* Module Header */}
            <ModuleHeader
              icon={IconBook2}
              title={t('generalLedger.pageTitle')}
              description={t('generalLedger.pageDescription')}
              actions={<ReportBackButton />}
              breadcrumbs={[
                { label: t('common.financialReports'), to: routes.reports.main },
                { label: t('catalog.generalLedgerTitle') },
              ]}
            />

            {/* Filter Bar with Date Range, Presets & View Modes */}
            <GeneralLedgerFilterBar
              preset={ledger.preset}
              onPresetChange={ledger.handlePresetChange}
              draftPeriod={ledger.draftPeriod}
              appliedPeriod={ledger.period}
              onDraftPeriodChange={ledger.setDraftPeriod}
              onApplyPeriod={ledger.handleApplyCustomPeriod}
              isFetching={ledger.query.isFetching}
              onRefresh={() => ledger.query.refetch()}
              onExport={(type) => ledger.exportMutation.mutate(type)}
              isExporting={ledger.exportMutation.isPending}
              onCancelExport={ledger.cancelExport}
              searchQuery={ledger.accountSearch}
              onSearchQueryChange={ledger.setAccountSearch}
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
                title={t('generalLedger.loadFailed')}
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
                    {t('common.retry')}
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
                  isBalanced={ledger.isBalanced}
                />

                {ledger.accounts.length === 0 ? (
                  <Paper withBorder radius="lg" p="xl" bg="white" shadow="xs">
                    <EmptyState
                      title={t('generalLedger.emptyTitle')}
                      description={t('generalLedger.emptyDescription')}
                      py={60}
                    />
                  </Paper>
                ) : (
                  <GeneralLedgerTable
                    accounts={ledger.filteredAccounts}
                    search={ledger.accountSearch}
                    onSearchChange={ledger.setAccountSearch}
                  />
                )}
              </>
            )}
          </Stack>
        </Box>
      </ReportPrecisionProvider>
    </AppShellLayout>
  );
}
