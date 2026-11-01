import { Box, Group, Skeleton, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { AUDIT_ACTIONS, type AuditEntityType } from '@/module/petty-cash/domain/reports';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { useAuditLog } from '@/module/petty-cash/presentation/hooks/useReportQueries';

interface Props {
  entityType: AuditEntityType;
  entityId: string | undefined;
}

/** Who did what to one document and when, newest first, as the backend recorded it. */
export function AuditTimeline({ entityType, entityId }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const canRead = usePettyCashAccess().can('JP-PC', 'read');
  const query = useAuditLog(entityType, canRead ? entityId : undefined);
  if (!canRead) return null;
  const label = (action: string) =>
    AUDIT_ACTIONS.includes(action) ? t(`audit.action.${action}`) : t('audit.action.other');

  return (
    <Box>
      <Text fw={700} mb="xs">
        {t('audit.title')}
      </Text>
      {query.isLoading && <Skeleton height={48} radius="sm" />}
      {query.isError && (
        <QueryErrorState
          title={t('audit.loadFailed')}
          error={query.error}
          onRetry={() => query.refetch()}
        />
      )}
      {query.data?.items.length === 0 && (
        <Text size="sm" c="dimmed">
          {t('audit.empty')}
        </Text>
      )}
      <Stack gap={6}>
        {query.data?.items.map((entry) => (
          <Group key={entry.id} gap="xs" wrap="nowrap" align="flex-start">
            <Text size="sm" fw={600}>
              {label(entry.action)}
            </Text>
            <Text size="xs" c="dimmed" pt={2}>
              {dateFormatV1(entry.createdAt)}
              {entry.byName ? ` · ${t('audit.by', { name: entry.byName })}` : ''}
              {entry.reason ? ` · ${entry.reason}` : ''}
            </Text>
          </Group>
        ))}
      </Stack>
    </Box>
  );
}
