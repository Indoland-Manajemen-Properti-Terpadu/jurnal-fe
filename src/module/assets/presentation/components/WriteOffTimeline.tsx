import { Text, ThemeIcon, Timeline } from '@mantine/core';
import { IconCheck, IconClockHour4, IconSend, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';

/** Submitted → waiting on the approver → posted or rejected. */
export function WriteOffTimeline({ report }: Readonly<{ report: WriteOffReport }>) {
  const { t } = useTranslation('assetWriteOffs');
  const decided = report.status !== 'PENDING_APPROVAL';
  const approved = report.status === 'APPROVED';
  const roles = report.waitingOnRoles.join(', ') || t('roleApprover');

  return (
    <>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="sm">
        {t('journeyTitle')}
      </Text>
      <Timeline active={decided ? 1 : 0} bulletSize={26} lineWidth={2} color="primary">
        <Timeline.Item
          bullet={<IconSend size={13} />}
          title={
            <Text size="sm" fw={600}>
              {t('journeySubmitted', { name: report.createdBy.name || '—' })}
            </Text>
          }
        >
          <Text size="xs" c="dimmed">
            {formatAssetDate(report.submittedAt)}
          </Text>
        </Timeline.Item>
        {decided ? (
          <Timeline.Item
            color={approved ? 'teal' : 'red'}
            bullet={approved ? <IconCheck size={13} /> : <IconX size={13} />}
            title={
              <Text size="sm" fw={600} c={approved ? 'teal.8' : 'red.8'}>
                {approved ? t('journeyApproved') : t('journeyRejected')}
              </Text>
            }
          >
            <Text size="xs" c="dimmed">
              {formatAssetDate(report.decidedAt)}
            </Text>
          </Timeline.Item>
        ) : (
          <Timeline.Item
            bullet={
              <ThemeIcon size={26} radius="xl" variant="light" color="orange">
                <IconClockHour4 size={13} />
              </ThemeIcon>
            }
            title={
              <Text size="sm" fw={600}>
                {t('journeyWaiting', { roles })}
              </Text>
            }
          />
        )}
      </Timeline>
    </>
  );
}

export default WriteOffTimeline;
