import React from 'react';
import { Alert, Box, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh, IconScale } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { useBalanceSheet } from '@/module/reports/presentation/hooks/useBalanceSheet';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { BalanceSheetFilterBar } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetFilterBar';
import { BalanceSheetSummary } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetSummary';
import { BalanceSheetReading } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetReading';
import { BalanceSheetStatement } from '@/module/reports/presentation/components/balance-sheet/BalanceSheetStatement';

import { useTranslation } from '@/i18n';

/** Route `/result-reports/business-overview/balance-sheet`: the balance sheet. */
export default function BalanceSheetPage() {
  const { t } = useTranslation('reports');
  const balanceSheet = useBalanceSheet();

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconScale}
            title={t('balanceSheet.pageTitle')}
            description={t('balanceSheet.pageDescription')}
          />

          <BalanceSheetFilterBar
            preset={balanceSheet.preset}
            onPresetChange={balanceSheet.handlePresetChange}
            draftPeriod={balanceSheet.draftPeriod}
            appliedPeriod={balanceSheet.period}
            onDraftPeriodChange={balanceSheet.setDraftPeriod}
            onApplyPeriod={balanceSheet.handleApplyCustomPeriod}
            isFetching={balanceSheet.query.isFetching}
            onRefresh={() => balanceSheet.query.refetch()}
            onExport={(type) => balanceSheet.exportMutation.mutate(type)}
            isExporting={balanceSheet.exportMutation.isPending}
            onCancelExport={balanceSheet.cancelExport}
            searchQuery={balanceSheet.searchQuery}
            onSearchQueryChange={balanceSheet.setSearchQuery}
            hasData={Boolean(balanceSheet.data)}
          />

          {balanceSheet.query.isPending && (
            <Stack gap="md">
              <Skeleton height={230} radius="lg" />
              <Skeleton height={110} radius="lg" />
              <Skeleton height={420} radius="lg" />
            </Stack>
          )}

          {balanceSheet.query.isError && (
            <Alert
              color="red"
              title={t('balanceSheet.loadFailed')}
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
                  {t('common.retry')}
                </Button>
              </Group>
            </Alert>
          )}

          {balanceSheet.data && (
            <>
              <BalanceSheetSummary data={balanceSheet.data} />
              <BalanceSheetReading data={balanceSheet.data} />
              <BalanceSheetStatement
                data={balanceSheet.data}
                searching={balanceSheet.searchQuery.trim() !== ''}
                currentAssets={balanceSheet.filteredCurrentAssets}
                nonCurrentAssets={balanceSheet.filteredNonCurrentAssets}
                depreciation={balanceSheet.filteredDepreciation}
                currentLiabilities={balanceSheet.filteredCurrentLiabilities}
                nonCurrentLiabilities={balanceSheet.filteredNonCurrentLiabilities}
                allLiabilities={balanceSheet.filteredAllLiabilities}
                equity={balanceSheet.filteredEquity}
              />
            </>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
