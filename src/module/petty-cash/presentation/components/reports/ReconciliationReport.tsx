import { Group, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck, IconScale } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { DocumentTable, TwoLine } from '@/module/petty-cash/presentation/components/DocumentTable';
import { DocumentNotice } from '@/module/petty-cash/presentation/components/DocumentDrawer';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { useReconciliationReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);

/** Pagu, ledger and cash book per fund; any difference is spelled out under the result. */
export function ReconciliationReport() {
  const { t } = useTranslation('pettyCash');
  const query = useReconciliationReport();
  const rows = query.data ?? [];

  return (
    <ReportShell
      title={t('reports.sections.reconciliation')}
      hint={t('reports.reconciliation.hint')}
    >
      {rows.some((row) => !row.isImprestBalanced) && (
        <DocumentNotice tone="warning">{t('reports.reconciliation.notBalanced')}</DocumentNotice>
      )}
      <DocumentTable
        filters={null}
        columns={[
          { key: 'fund', label: t('reports.reconciliation.columns.fund') },
          { key: 'pagu', label: t('reports.reconciliation.columns.pagu'), numeric: true },
          { key: 'gl', label: t('reports.reconciliation.columns.gl'), numeric: true },
          { key: 'cashBook', label: t('reports.reconciliation.columns.cashBook'), numeric: true },
          { key: 'status', label: t('reports.reconciliation.columns.status') },
        ]}
        items={query.data}
        rowKey={(row) => row.fund.id}
        cells={(row) => [
          <TwoLine
            key="fund"
            primary={`${row.fund.code} · ${row.fund.name}`}
            secondary={row.fund.accountNumber}
          />,
          money(row.pagu),
          money(row.glBalance),
          money(row.cashBookBalance),
          <Stack key="status" gap={2}>
            <Group gap={6} wrap="nowrap">
              {row.isOk ? (
                <IconCircleCheck size={15} color="var(--mantine-color-teal-7)" />
              ) : (
                <IconAlertTriangle size={15} color="var(--mantine-color-orange-7)" />
              )}
              <Text size="sm" fw={500} c={row.isOk ? 'dark.8' : 'orange.8'}>
                {t(row.isOk ? 'reports.reconciliation.ok' : 'reports.reconciliation.notOk')}
              </Text>
            </Group>
            {row.glDifference !== 0 && (
              <Text size="xs" c="dimmed">
                {t('reports.reconciliation.glDifference', { amount: money(row.glDifference) })}
              </Text>
            )}
            {row.cashBookDifference !== 0 && (
              <Text size="xs" c="dimmed">
                {t('reports.reconciliation.cashBookDifference', {
                  amount: money(row.cashBookDifference),
                })}
              </Text>
            )}
          </Stack>,
        ]}
        minWidth={680}
        loading={query.isLoading}
        fetching={query.isFetching}
        stale={false}
        error={
          query.isError
            ? { title: t('reports.loadFailed'), error: query.error, onRetry: () => query.refetch() }
            : null
        }
        empty={{
          icon: <IconScale size={32} />,
          title: t('reports.emptyTitle'),
          description: t('reports.empty'),
        }}
      />
    </ReportShell>
  );
}
