import { Alert, Box, Button, Group, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ErrorAlert } from '@/components/ErrorAlert';
import { useTranslation } from '@/i18n';
import { useCompanySite } from '@/module/profile';
import { ProfitLossDisplayControls } from '@/module/reports/presentation/components/profit-loss/ProfitLossDisplayControls';
import { ProfitLossHeader } from '@/module/reports/presentation/components/profit-loss/ProfitLossHeader';
import { ProfitLossPeriodFilters } from '@/module/reports/presentation/components/profit-loss/ProfitLossPeriodFilters';
import { ProfitLossStatementTable } from '@/module/reports/presentation/components/profit-loss/ProfitLossStatementTable';
import { ProfitLossSummaryPanel } from '@/module/reports/presentation/components/profit-loss/ProfitLossSummaryPanel';
import { ProfitLossTable } from '@/module/reports/presentation/components/profit-loss/ProfitLossTable';
import { ReportRequestError } from '@/module/reports/infrastructure/reportRequest';
import { useProfitLoss } from '@/module/reports/presentation/hooks/useProfitLoss';
import { ReportPrecisionProvider } from '@/module/reports/presentation/hooks/useReportPrecision';

/** Route `/result-reports/business-overview/income-statement`: the profit and loss statement. */
export default function IncomeStatementPage() {
  const { t, currentLanguage } = useTranslation('reports');
  const profitLoss = useProfitLoss();
  const { site } = useCompanySite();
  const { query, report, shown } = profitLoss;

  return (
    <AppShellLayout>
      <ReportPrecisionProvider
        precision={profitLoss.report?.precision}
        negativeFormat={profitLoss.report?.negativeFormat}
      >
        <Box px={{ base: 'md', sm: 'sm' }} pt={0} pb="md" style={{ marginTop: -8 }}>
          <Stack gap="lg">
            <ProfitLossHeader
              hasData={Boolean(report)}
              isExporting={profitLoss.exportMutation.isPending}
              onExport={(type) => profitLoss.exportMutation.mutate(type)}
              onPrint={() => window.print()}
            />

            {!profitLoss.allowed && (
              <ErrorAlert
                title={t('profitLoss.noAccessTitle')}
                message={t('profitLoss.noAccessMessage')}
              />
            )}

            {profitLoss.allowed && (
              <ProfitLossPeriodFilters
                preset={profitLoss.preset}
                onPresetChange={profitLoss.selectPreset}
                period={profitLoss.period}
                onPeriodChange={profitLoss.applyRange}
                comparisonPreset={profitLoss.comparisonPreset}
                onComparisonPresetChange={profitLoss.setComparisonPreset}
                customComparePeriod={profitLoss.customComparePeriod}
                onCustomComparePeriodChange={profitLoss.setCustomComparePeriod}
                comparePeriod={profitLoss.comparePeriod}
              />
            )}

            {query.isPending && (
              <Stack gap="md">
                <Skeleton height={320} radius="lg" />
                <Skeleton height={500} radius="lg" />
              </Stack>
            )}

            {query.isError &&
              query.error instanceof ReportRequestError &&
              query.error.status === 403 && (
                <ErrorAlert
                  title={t('profitLoss.noAccessTitle')}
                  message={t('profitLoss.noAccessMessage')}
                />
              )}

            {query.isError &&
              !(query.error instanceof ReportRequestError && query.error.status === 403) && (
                <Alert
                  color="red"
                  title={t('profitLoss.loadFailed')}
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

            {report && (
              <>
                <ProfitLossSummaryPanel report={report} />
                <ProfitLossDisplayControls
                  search={profitLoss.search}
                  onSearchChange={profitLoss.setSearch}
                  hideZero={profitLoss.hideZero}
                  onHideZeroChange={profitLoss.setHideZero}
                  mode={profitLoss.viewMode}
                  onModeChange={profitLoss.setViewMode}
                />
                {report.statement ? (
                  <ProfitLossStatementTable
                    statement={report.statement.current}
                    compare={report.statement.compare}
                    mode={profitLoss.viewMode}
                    hideZero={profitLoss.hideZero}
                    search={profitLoss.search}
                    onResetSearch={() => profitLoss.setSearch('')}
                    companyName={site?.name}
                    language={currentLanguage}
                  />
                ) : (
                  <ProfitLossTable
                    lines={shown.lines}
                    accountCount={shown.accountCount}
                    search={profitLoss.search}
                    onResetSearch={() => profitLoss.setSearch('')}
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
