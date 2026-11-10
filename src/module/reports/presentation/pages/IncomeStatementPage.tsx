import React from 'react';
import { Alert, Box, Button, Group, Grid, Skeleton, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconChartBar, IconRefresh } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ErrorAlert } from '@/components/ErrorAlert';
import { ProfitLossRequestError } from '@/module/reports/infrastructure/profitLossApi';
import { ProfitLossFilterBar } from '@/module/reports/presentation/components/profit-loss/ProfitLossFilterBar';
import { ProfitLossSummary } from '@/module/reports/presentation/components/profit-loss/ProfitLossSummary';
import { ProfitLossTable } from '@/module/reports/presentation/components/profit-loss/ProfitLossTable';
import { ReportPageHeader } from '@/module/reports/presentation/components/shared/ReportPageHeader';
import { useProfitLoss } from '@/module/reports/presentation/hooks/useProfitLoss';

import { useTranslation } from '@/i18n';

/** Route `/result-reports/business-overview/income-statement`: the profit and loss statement. */
export default function IncomeStatementPage() {
  const { t } = useTranslation('reports');
  const profitLoss = useProfitLoss();
  const { query, report, shown } = profitLoss;

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ReportPageHeader
            icon={IconChartBar}
            title={t('catalog.incomeStatementTitle')}
            description={t('profitLoss.description')}
          />

          {!profitLoss.allowed && (
            <ErrorAlert
              title={t('profitLoss.noAccessTitle')}
              message={t('profitLoss.noAccessMessage')}
            />
          )}

          {profitLoss.allowed && (
            <ProfitLossFilterBar
              preset={profitLoss.preset}
              onPresetChange={profitLoss.selectPreset}
              draftPeriod={profitLoss.draftPeriod}
              onDraftPeriodChange={profitLoss.setDraftPeriod}
              appliedPeriod={profitLoss.period}
              onApplyPeriod={profitLoss.applyDraft}
              isFetching={query.isFetching}
              onRefresh={() => query.refetch()}
              onExport={(type) => profitLoss.exportMutation.mutate(type)}
              isExporting={profitLoss.exportMutation.isPending}
              onCancelExport={profitLoss.cancelExport}
              searchQuery={profitLoss.search}
              onSearchQueryChange={profitLoss.setSearch}
              hasData={Boolean(report)}
            />
          )}

          {query.isPending && (
            <Stack gap="md">
              <Skeleton height={110} radius="lg" />
              <Grid gutter="md">
                <Grid.Col span={12}>
                  <Skeleton height={480} radius="lg" />
                </Grid.Col>
              </Grid>
            </Stack>
          )}

          {query.isError &&
            query.error instanceof ProfitLossRequestError &&
            query.error.status === 403 && (
              <ErrorAlert
                title={t('profitLoss.noAccessTitle')}
                message={t('profitLoss.noAccessMessage')}
              />
            )}

          {query.isError &&
            !(query.error instanceof ProfitLossRequestError && query.error.status === 403) && (
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
              <ProfitLossSummary report={report} />
              <ProfitLossTable
                lines={shown.lines}
                accountCount={shown.accountCount}
                search={profitLoss.search}
                onResetSearch={() => profitLoss.setSearch('')}
              />
            </>
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
