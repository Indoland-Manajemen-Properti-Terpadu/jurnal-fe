import { Group, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { ConnectionEvent } from '@/module/bank-connection/domain/connection';
import { formatMoment } from '@/module/bank-connection/presentation/components/formatMoment';

/** What happened to a request, oldest first, in the words of the status. */
export function ConnectionTimeline({ events }: Readonly<{ events: ConnectionEvent[] }>) {
  const { t, currentLanguage } = useTranslation('bankConnection');
  if (events.length === 0) {
    return (
      <Text fz="sm" c="dimmed">
        {t('detail.historyEmpty')}
      </Text>
    );
  }
  return (
    <Stack gap="sm" component="ol" m={0} p={0} style={{ listStyle: 'none' }}>
      {events.map((event) => (
        <li key={event.id}>
          <Group gap="sm" align="flex-start" wrap="nowrap">
            <span
              aria-hidden="true"
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: 'var(--mantine-color-primary-6)',
                marginTop: 7,
                flex: 'none',
              }}
            />
            <div>
              <Text fz="sm" fw={600}>
                {t(`status.${event.toStatus}`)}
              </Text>
              <Text fz={12} c="dimmed">
                {formatMoment(event.at, currentLanguage)}
                {event.actor ? ` · ${event.actor}` : ''}
              </Text>
              {event.reason && (
                <Text fz={12} c="dimmed">
                  {event.reason}
                </Text>
              )}
            </div>
          </Group>
        </li>
      ))}
    </Stack>
  );
}
