import { Alert, Badge, Paper, Table, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { useReconciliationReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);

/** Pagu, ledger and cash book per fund; any difference is spelled out beside the status. */
export function ReconciliationReport() {
  const { t } = useTranslation('pettyCash');
  const query = useReconciliationReport();
  const rows = query.data ?? [];

  return (
    <ReportShell hint={t('reports.reconciliation.hint')} query={query}>
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('reports.empty')}
        </Text>
      ) : (
        <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={640}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th>{t('reports.reconciliation.columns.fund')}</Table.Th>
                  <Table.Th ta="right">{t('reports.reconciliation.columns.pagu')}</Table.Th>
                  <Table.Th ta="right">{t('reports.reconciliation.columns.gl')}</Table.Th>
                  <Table.Th ta="right">{t('reports.reconciliation.columns.cashBook')}</Table.Th>
                  <Table.Th>{t('reports.reconciliation.columns.status')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.fund.id}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {row.fund.code} · {row.fund.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {row.fund.accountNumber}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">{money(row.pagu)}</Table.Td>
                    <Table.Td ta="right">{money(row.glBalance)}</Table.Td>
                    <Table.Td ta="right">{money(row.cashBookBalance)}</Table.Td>
                    <Table.Td>
                      <Badge
                        color={row.isOk ? 'teal' : 'orange'}
                        variant="light"
                        radius="sm"
                        tt="none"
                      >
                        {t(row.isOk ? 'reports.reconciliation.ok' : 'reports.reconciliation.notOk')}
                      </Badge>
                      {row.glDifference !== 0 && (
                        <Text size="xs" c="dimmed">
                          {t('reports.reconciliation.glDifference', {
                            amount: money(row.glDifference),
                          })}
                        </Text>
                      )}
                      {row.cashBookDifference !== 0 && (
                        <Text size="xs" c="dimmed">
                          {t('reports.reconciliation.cashBookDifference', {
                            amount: money(row.cashBookDifference),
                          })}
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
      {rows.some((row) => !row.isImprestBalanced) && (
        <Alert color="orange" icon={<IconAlertCircle size={18} />} radius="md">
          {t('reports.reconciliation.notBalanced')}
        </Alert>
      )}
    </ReportShell>
  );
}
