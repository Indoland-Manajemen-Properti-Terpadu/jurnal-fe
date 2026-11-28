import React from 'react';
import { Alert, Box, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ReportRequestError } from '@/module/reports/infrastructure/reportRequest';
import { TrialBalanceFilterBar } from '@/module/reports/presentation/components/trial-balance/TrialBalanceFilterBar';
import { TrialBalanceHeader } from '@/module/reports/presentation/components/trial-balance/TrialBalanceHeader';
import { TrialBalanceSummary } from '@/module/reports/presentation/components/trial-balance/TrialBalanceSummary';
import { TrialBalanceTable } from '@/module/reports/presentation/components/trial-balance/TrialBalanceTable';
import { useTrialBalance } from '@/module/reports/presentation/hooks/useTrialBalance';
import { useTranslation } from '@/i18n';
import { useCompanySite } from '@/module/profile';
import { ReportPrecisionProvider } from '@/module/reports/presentation/hooks/useReportPrecision';
import { TrialBalanceDisplayControls } from '@/module/reports/presentation/components/trial-balance/TrialBalanceDisplayControls';
import { TrialBalanceStatementTable } from '@/module/reports/presentation/components/trial-balance/TrialBalanceStatementTable';

/** Route `/result-reports/business-overview/trial-balance`: the trial balance. */
export default function TrialBalancePage() {
  const { t } = useTranslation('reports');
  const { site } = useCompanySite();
  const trialBalance = useTrialBalance();
  const { query, report, accounts, sections } = trialBalance;
  const forbidden = query.error instanceof ReportRequestError && query.error.status === 403;

  return (
    <AppShellLayout>
      <ReportPrecisionProvider
        precision={trialBalance.report?.precision}
        negativeFormat={trialBalance.report?.negativeFormat}
      >
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <TrialBalanceHeader
              hasData={Boolean(report)}
              isExporting={trialBalance.exportMutation.isPending}
              onExport={(type) => trialBalance.exportMutation.mutate(type)}
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
                period={trialBalance.period}
                onPeriodChange={trialBalance.applyRange}
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
                <TrialBalanceDisplayControls
                  search={trialBalance.search}
                  onSearchChange={trialBalance.setSearch}
                  hideZero={trialBalance.hideZero}
                  onHideZeroChange={trialBalance.setHideZero}
                  mode={trialBalance.mode}
                  onModeChange={trialBalance.setMode}
                />
                {report.statement ? (
                  <TrialBalanceStatementTable
                    statement={report.statement}
                    mode={trialBalance.mode}
                    search={trialBalance.search}
                    onResetSearch={() => trialBalance.setSearch('')}
                    companyName={site?.name}
                  />
                ) : (
                  <TrialBalanceTable
                    report={report}
                    sections={sections}
                    accountCount={accounts.length}
                    search={trialBalance.search}
                    onResetSearch={() => trialBalance.setSearch('')}
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
