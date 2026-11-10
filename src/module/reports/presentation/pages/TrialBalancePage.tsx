import React from 'react';
import { Alert, Box, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconFileAnalytics, IconRefresh } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ReportRequestError } from '@/module/reports/infrastructure/reportRequest';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { TrialBalanceFilterBar } from '@/module/reports/presentation/components/trial-balance/TrialBalanceFilterBar';
import { TrialBalanceSummary } from '@/module/reports/presentation/components/trial-balance/TrialBalanceSummary';
import { TrialBalanceTable } from '@/module/reports/presentation/components/trial-balance/TrialBalanceTable';
import { useTrialBalance } from '@/module/reports/presentation/hooks/useTrialBalance';
import { useTranslation } from '@/i18n';

/** Route `/result-reports/business-overview/trial-balance`: the trial balance. */
export default function TrialBalancePage() {
  const { t } = useTranslation('reports');
  const trialBalance = useTrialBalance();
  const { query, report, accounts } = trialBalance;
  const forbidden = query.error instanceof ReportRequestError && query.error.status === 403;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconFileAnalytics}
            title={t('catalog.trialBalanceTitle')}
            description={t('trialBalance.description')}
          />

          {!trialBalance.allowed && (
            <ErrorAlert
              title={t('trialBalance.noAccessTitle')}
              message={t('trialBalance.noAccessMessage')}
            />
          )}

          {trialBalance.allowed && (
            <TrialBalanceFilterBar
              preset={trialBalance.preset}
              onPresetChange={trialBalance.selectPreset}
              draftPeriod={trialBalance.draftPeriod}
              onDraftPeriodChange={trialBalance.setDraftPeriod}
              appliedPeriod={trialBalance.period}
              onApplyPeriod={trialBalance.applyDraft}
              isFetching={query.isFetching}
              onRefresh={() => query.refetch()}
              onExport={(type) => trialBalance.exportMutation.mutate(type)}
              isExporting={trialBalance.exportMutation.isPending}
              onCancelExport={trialBalance.cancelExport}
              searchQuery={trialBalance.search}
              onSearchQueryChange={trialBalance.setSearch}
              hasData={Boolean(report)}
            />
          )}

          {query.isPending && trialBalance.allowed && (
            <Stack gap="md">
              <Skeleton height={110} radius="lg" />
              <Skeleton height={480} radius="lg" />
            </Stack>
          )}

          {query.isError && forbidden && (
            <ErrorAlert
              title={t('trialBalance.noAccessTitle')}
              message={t('trialBalance.noAccessMessage')}
            />
          )}

          {query.isError && !forbidden && (
            <Alert
              color="red"
              title={t('trialBalance.loadFailed')}
              icon={<IconAlertTriangle size={20} />}
              radius="lg"
            >
              <Group justify="space-between" align="center" gap="sm">
                <Text size="sm">{query.error.message}</Text>
                <Button
                  size="xs"
                  variant="light"
                  color="red"
                  leftSection={<IconRefresh size={14} />}
                  onClick={() => query.refetch()}
                >
                  {t('common.retry')}
                </Button>
              </Group>
            </Alert>
          )}

          {report && trialBalance.allowed && (
            <>
              <TrialBalanceSummary report={report} />
              <TrialBalanceTable
                report={report}
                accounts={accounts}
                search={trialBalance.search}
                onResetSearch={() => trialBalance.setSearch('')}
              />
            </>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
