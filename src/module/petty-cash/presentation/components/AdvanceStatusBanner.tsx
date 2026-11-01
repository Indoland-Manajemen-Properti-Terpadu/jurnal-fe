import { Alert, List, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';
import { useAdvanceStatus } from '@/module/petty-cash/presentation/hooks/useAdvanceQueries';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';

/** Tells a requester why new advances are on hold; nothing is shown while the standing is fine. */
export function AdvanceStatusBanner() {
  const { t } = useTranslation('pettyCash');
  const access = usePettyCashAccess();
  const status = useAdvanceStatus(access.canRequestAdvance() ? 'me' : undefined);
  if (!status.data?.isBlocked) return null;

  return (
    <Alert
      color="orange"
      radius="md"
      icon={<IconAlertCircle size={18} />}
      title={t('advances.myStatusBlocked')}
    >
      <Text size="sm">{t('advances.myStatusBlockedHint')}</Text>
      <List size="sm" mt="xs" spacing={2}>
        {status.data.reasons.map((reason) => (
          <List.Item key={`${reason.type}-${reason.since ?? ''}`}>
            {t(reason.type === 'MANUAL' ? 'advances.reasonManual' : 'advances.reasonOverdue')}
            {reason.since ? ` (${dateFormatV1(reason.since)})` : ''}
          </List.Item>
        ))}
      </List>
      {status.data.overrideUntil && (
        <Text size="sm" mt="xs">
          {t('advances.overrideUntil', { date: dateFormatV1(status.data.overrideUntil) })}
        </Text>
      )}
    </Alert>
  );
}
