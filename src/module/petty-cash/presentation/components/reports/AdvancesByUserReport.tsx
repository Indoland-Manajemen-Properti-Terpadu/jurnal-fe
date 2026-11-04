import { useState } from 'react';
import { Button, Text } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { DocumentTable, TwoLine } from '@/module/petty-cash/presentation/components/DocumentTable';
import { RestrictionDialog } from '@/module/petty-cash/presentation/components/RestrictionDialog';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { useAdvancesByUserReport } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const money = (amount: number) => formatCurrency(amount, false);

/** Each employee's advances on this fund; the control right can block or grant an exception. */
export function AdvancesByUserReport({ fundId }: Readonly<{ fundId: string }>) {
  const { t } = useTranslation('pettyCash');
  const query = useAdvancesByUserReport(fundId);
  const canControl = usePettyCashAccess().canControlRestrictions();
  const [managed, setManaged] = useState<{ id: string; name: string } | null>(null);

  return (
    <ReportShell title={t('reports.sections.advances')} hint={t('reports.advances.hint')}>
      <DocumentTable
        filters={null}
        columns={[
          { key: 'name', label: t('reports.advances.columns.name') },
          { key: 'total', label: t('reports.advances.columns.total'), numeric: true },
          { key: 'outstanding', label: t('reports.advances.columns.outstanding'), numeric: true },
          { key: 'overdue', label: t('reports.advances.columns.overdue'), numeric: true },
          { key: 'late', label: t('reports.advances.columns.late'), numeric: true },
          { key: 'receivable', label: t('reports.advances.columns.receivable'), numeric: true },
          { key: 'last', label: t('reports.advances.columns.last') },
          ...(canControl ? [{ key: 'action', label: '', align: 'right' as const }] : []),
        ]}
        items={query.data}
        rowKey={(row) => row.requesterId}
        cells={(row) => [
          <TwoLine
            key="name"
            primary={row.requesterName}
            secondary={
              row.isBlocked ? (
                <Text span size="xs" c="orange.8" fw={600}>
                  {t('reports.advances.blocked')}
                </Text>
              ) : undefined
            }
          />,
          <TwoLine
            key="total"
            primary={money(row.totalAmount)}
            secondary={t('reports.advances.times', { count: row.totalCount })}
          />,
          money(row.outstandingAmount),
          row.overdueCount,
          row.settledLateCount,
          money(row.receivableAmount),
          row.lastAdvanceAt ? dateFormatV1(row.lastAdvanceAt) : '-',
          ...(canControl
            ? [
                <Button
                  key="action"
                  variant="subtle"
                  size="xs"
                  onClick={() => setManaged({ id: row.requesterId, name: row.requesterName })}
                >
                  {t('restriction.manage')}
                </Button>,
              ]
            : []),
        ]}
        minWidth={860}
        loading={query.isLoading}
        fetching={query.isFetching}
        stale={false}
        error={
          query.isError
            ? { title: t('reports.loadFailed'), error: query.error, onRetry: () => query.refetch() }
            : null
        }
        empty={{
          icon: <IconUsers size={32} />,
          title: t('reports.emptyTitle'),
          description: t('reports.empty'),
        }}
      />
      {managed && (
        <RestrictionDialog
          key={managed.id}
          userId={managed.id}
          name={managed.name}
          opened
          onClose={() => setManaged(null)}
        />
      )}
    </ReportShell>
  );
}
