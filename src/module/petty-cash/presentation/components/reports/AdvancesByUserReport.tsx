import { Badge, Paper, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { useAdvancesByUserReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);

export function AdvancesByUserReport({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const query = useAdvancesByUserReport(fundId);
  const rows = query.data ?? [];

  return (
    <ReportShell hint={t('reports.advances.hint')} query={query}>
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          {t('reports.empty')}
        </Text>
      ) : (
        <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
          <Table.ScrollContainer minWidth={760}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead bg="gray.0">
                <Table.Tr>
                  <Table.Th>{t('reports.advances.columns.name')}</Table.Th>
                  <Table.Th ta="right">{t('reports.advances.columns.total')}</Table.Th>
                  <Table.Th ta="right">{t('reports.advances.columns.outstanding')}</Table.Th>
                  <Table.Th ta="right">{t('reports.advances.columns.overdue')}</Table.Th>
                  <Table.Th ta="right">{t('reports.advances.columns.late')}</Table.Th>
                  <Table.Th ta="right">{t('reports.advances.columns.receivable')}</Table.Th>
                  <Table.Th>{t('reports.advances.columns.last')}</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {rows.map((row) => (
                  <Table.Tr key={row.requesterId}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {row.requesterName}
                      </Text>
                      {row.isBlocked && (
                        <Badge color="orange" variant="light" radius="sm" tt="none">
                          {t('reports.advances.blocked')}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      {money(row.totalAmount)}
                      <Text size="xs" c="dimmed">
                        {t('reports.advances.times', { count: row.totalCount })}
                      </Text>
                    </Table.Td>
                    <Table.Td ta="right">{money(row.outstandingAmount)}</Table.Td>
                    <Table.Td ta="right">{row.overdueCount}</Table.Td>
                    <Table.Td ta="right">{row.settledLateCount}</Table.Td>
                    <Table.Td ta="right">{money(row.receivableAmount)}</Table.Td>
                    <Table.Td>{row.lastAdvanceAt ? dateFormatV1(row.lastAdvanceAt) : '-'}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      )}
    </ReportShell>
  );
}
