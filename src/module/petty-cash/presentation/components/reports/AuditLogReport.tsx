import { useState } from 'react';
import { Select, Text } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import {
  AUDIT_ACTIONS,
  AUDIT_ACTIONS_BY_TYPE,
  AUDIT_ENTITY_TYPES,
  type AuditEntityType,
} from '@/module/petty-cash/domain/reports';
import { DocumentTable } from '@/module/petty-cash/presentation/components/DocumentTable';
import { ReportShell } from '@/module/petty-cash/presentation/components/reports/ReportShell';
import { useAuditLogs } from '@/module/petty-cash/presentation/hooks/useReportQueries';

const PAGE_SIZE = 20;
const ALL_ACTIONS = Array.from(new Set(Object.values(AUDIT_ACTIONS_BY_TYPE).flat()));

/** Every recorded change across the module, filterable by kind of document and action. */
export function AuditLogReport() {
  const { t } = useTranslation('pettyCash');
  const [entityType, setEntityType] = useState<AuditEntityType | null>(null);
  const [action, setAction] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const query = useAuditLogs({
    entityType: entityType ?? undefined,
    action: action ?? undefined,
    page,
    limit: PAGE_SIZE,
  });
  const results = query.data;
  const actions = entityType ? AUDIT_ACTIONS_BY_TYPE[entityType] : ALL_ACTIONS;
  const actionLabel = (value: string) =>
    AUDIT_ACTIONS.includes(value) ? t(`audit.action.${value}`) : t('audit.action.other');

  return (
    <ReportShell title={t('reports.sections.audit')} hint={t('reports.audit.hint')}>
      <DocumentTable
        filters={
          <>
            <Select
              aria-label={t('reports.audit.type')}
              placeholder={t('reports.audit.allTypes')}
              data={AUDIT_ENTITY_TYPES.map((value) => ({
                value,
                label: t(`reports.audit.types.${value}`),
              }))}
              value={entityType}
              onChange={(value) => {
                setEntityType(value as AuditEntityType | null);
                setAction(null);
                setPage(1);
              }}
              clearable
              clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
              w={{ base: '100%', sm: 220 }}
            />
            <Select
              aria-label={t('reports.audit.action')}
              placeholder={t('reports.audit.allActions')}
              data={actions.map((value) => ({ value, label: actionLabel(value) }))}
              value={action}
              onChange={(value) => {
                setAction(value);
                setPage(1);
              }}
              clearable
              searchable
              clearButtonProps={{ 'aria-label': t('common.clearFilters') }}
              w={{ base: '100%', sm: 240 }}
            />
          </>
        }
        countLabel={results ? t('reports.audit.count', { count: results.totalResults }) : undefined}
        columns={[
          { key: 'when', label: t('reports.audit.columns.when') },
          { key: 'type', label: t('reports.audit.columns.type') },
          { key: 'action', label: t('reports.audit.columns.action') },
          { key: 'by', label: t('reports.audit.columns.by') },
          { key: 'reason', label: t('reports.audit.columns.reason') },
        ]}
        items={results?.items}
        rowKey={(entry) => entry.id}
        cells={(entry) => [
          <Text key="when" size="sm" style={{ whiteSpace: 'nowrap' }}>
            {dateFormatV1(entry.createdAt, 'DD MMM YYYY · HH:mm')}
          </Text>,
          AUDIT_ENTITY_TYPES.includes(entry.entityType as AuditEntityType)
            ? t(`reports.audit.types.${entry.entityType}`)
            : '-',
          <Text key="action" size="sm" fw={500} c="dark.8">
            {actionLabel(entry.action)}
          </Text>,
          entry.byName || '-',
          <Text key="reason" size="sm" c={entry.reason ? 'dark.8' : 'dimmed'} lineClamp={2}>
            {entry.reason || '-'}
          </Text>,
        ]}
        minWidth={720}
        loading={query.isLoading}
        fetching={query.isFetching}
        stale={query.isPlaceholderData}
        error={
          query.isError
            ? { title: t('reports.loadFailed'), error: query.error, onRetry: () => query.refetch() }
            : null
        }
        empty={{
          icon: <IconHistory size={32} />,
          title: t('reports.emptyTitle'),
          description: t('reports.empty'),
        }}
        pagination={
          results && {
            page,
            totalPages: results.totalPages,
            totalResults: results.totalResults,
            limit: PAGE_SIZE,
            onChange: setPage,
          }
        }
      />
    </ReportShell>
  );
}
