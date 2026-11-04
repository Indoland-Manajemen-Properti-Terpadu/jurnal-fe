import { Skeleton, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { auditActionTone } from '@/module/petty-cash/domain/historyTone';
import { AUDIT_ACTIONS, type AuditEntityType } from '@/module/petty-cash/domain/reports';
import { CollapsibleSection } from '@/module/petty-cash/presentation/components/DetailKit';
import { HistoryTimeline } from '@/module/petty-cash/presentation/components/HistoryTimeline';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { useAuditLog } from '@/module/petty-cash/presentation/hooks/useReportQueries';

interface Props {
  entityType: AuditEntityType;
  entityId: string | undefined;
}

/**
 * Who changed what and when, newest first, as the backend recorded it. A record for review rather
 * than part of the task, so it stays folded until opened.
 */
export function AuditTimeline({ entityType, entityId }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const canRead = usePettyCashAccess().can('JP-PC', 'read');
  const query = useAuditLog(entityType, canRead ? entityId : undefined);
  if (!canRead) return null;

  const label = (action: string) =>
    AUDIT_ACTIONS.includes(action) ? t(`audit.action.${action}`) : t('audit.action.other');
  const items = query.data?.items ?? [];

  return (
    <CollapsibleSection
      title={t('detail.changeHistory')}
      count={items.length > 0 ? t('detail.changeCount', { count: items.length }) : undefined}
      showLabel={t('detail.show')}
      hideLabel={t('detail.hide')}
    >
      {query.isLoading && <Skeleton height={48} radius="sm" />}
      {query.isError && (
        <QueryErrorState
          title={t('audit.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}
      {query.data && items.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('audit.empty')}
        </Text>
      )}
      {items.length > 0 && (
        <HistoryTimeline
          entries={items.map((entry) => ({
            id: entry.id,
            title: label(entry.action),
            at: entry.createdAt,
            by: entry.byName,
            note: entry.reason,
            state: 'done',
            refused: auditActionTone(entry.action) === 'danger',
          }))}
        />
      )}
    </CollapsibleSection>
  );
}
