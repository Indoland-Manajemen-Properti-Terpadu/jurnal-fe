import { useState } from 'react';
import { Group, Pagination, Paper, Select, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import {
  AUDIT_ACTIONS,
  AUDIT_ACTIONS_BY_TYPE,
  AUDIT_ENTITY_TYPES,
  type AuditEntityType,
} from '@/module/petty-cash/domain/reports';
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
    <ReportShell
      hint={t('reports.audit.hint')}
      query={query}
      controls={
        <Group align="flex-end" gap="md" wrap="wrap">
          <Select
            label={t('reports.audit.type')}
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
            label={t('reports.audit.action')}
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
            w={{ base: '100%', sm: 260 }}
          />
          {results && (
            <Text size="xs" c="dimmed" pb={8} aria-live="polite">
              {t('reports.audit.count', { count: results.totalResults })}
            </Text>
          )}
        </Group>
      }
    >
      {results &&
        (results.items.length === 0 ? (
          <Text size="sm" c="dimmed">
            {t('reports.empty')}
          </Text>
        ) : (
          <Paper
            withBorder
            radius="md"
            bg="white"
            style={{
              overflow: 'hidden',
              opacity: query.isPlaceholderData ? 0.55 : 1,
              transition: 'opacity 150ms ease',
            }}
            aria-busy={query.isFetching}
          >
            <Table.ScrollContainer minWidth={680}>
              <Table verticalSpacing="sm" horizontalSpacing="md">
                <Table.Thead bg="gray.0">
                  <Table.Tr>
                    <Table.Th>{t('reports.audit.columns.when')}</Table.Th>
                    <Table.Th>{t('reports.audit.columns.type')}</Table.Th>
                    <Table.Th>{t('reports.audit.columns.action')}</Table.Th>
                    <Table.Th>{t('reports.audit.columns.by')}</Table.Th>
                    <Table.Th>{t('reports.audit.columns.reason')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {results.items.map((entry) => (
                    <Table.Tr key={entry.id}>
                      <Table.Td>{dateFormatV1(entry.createdAt, 'DD/MM/YYYY HH:mm')}</Table.Td>
                      <Table.Td>
                        {AUDIT_ENTITY_TYPES.includes(entry.entityType as AuditEntityType)
                          ? t(`reports.audit.types.${entry.entityType}`)
                          : '-'}
                      </Table.Td>
                      <Table.Td fw={600}>{actionLabel(entry.action)}</Table.Td>
                      <Table.Td>{entry.byName || '-'}</Table.Td>
                      <Table.Td>{entry.reason || '-'}</Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        ))}
      {results && results.totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {t('common.page')} {results.page} {t('common.of')} {results.totalPages}
          </Text>
          <Pagination value={page} onChange={setPage} total={results.totalPages} size="sm" />
        </Group>
      )}
    </ReportShell>
  );
}
