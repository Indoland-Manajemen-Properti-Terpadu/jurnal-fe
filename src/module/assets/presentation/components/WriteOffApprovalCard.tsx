import { useState } from 'react';
import { Alert, Button, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconShieldCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { WriteOffReport } from '@/module/assets/domain/writeOff';
import { AssetCard } from '@/module/assets/presentation/components/AssetSection';
import { formatAssetDate } from '@/module/assets/presentation/components/formatAssetDate';
import { StepTimeline, type StepItem } from '@/module/assets/presentation/components/StepTimeline';
import { useCurrentUserId } from '@/module/assets/presentation/hooks/useWriteOffQueries';
import {
  WriteOffApproveModal,
  WriteOffRejectModal,
} from '@/module/assets/presentation/components/WriteOffDecisionModals';

/**
 * Who filed the report, who still has to sign it, and the decision when it is the user's — the
 * same card as the purchasing approvals.
 */
export function WriteOffApprovalCard({ report }: Readonly<{ report: WriteOffReport }>) {
  const { t } = useTranslation('assetWriteOffs');
  const me = useCurrentUserId().data;
  const [open, setOpen] = useState<'approve' | 'reject' | null>(null);
  const waiting = report.status === 'PENDING_APPROVAL';
  const decider = report.signatures[1];
  const roles = report.waitingOnRoles.join(', ') || t('roleApprover');

  const decided: StepItem | null =
    report.status === 'APPROVED'
      ? {
          id: 'approved',
          state: 'done',
          children: (
            <>
              <Text size="sm" fw={600} c="dark.8" lh={1.4}>
                {t('stepApproved', { name: decider?.name ?? roles })}
              </Text>
              <Text size="xs" c="dimmed">
                {formatAssetDate(report.decidedAt)} · {t('stepPosted')}
              </Text>
            </>
          ),
        }
      : report.status === 'REJECTED'
        ? {
            id: 'rejected',
            state: 'refused',
            children: (
              <>
                <Text size="sm" fw={600} c="dark.8" lh={1.4}>
                  {t('stepRejected', { name: decider?.name ?? roles })}
                </Text>
                <Text size="xs" c="dimmed">
                  {formatAssetDate(report.decidedAt)}
                </Text>
              </>
            ),
          }
        : null;

  const steps: StepItem[] = [
    {
      id: 'submitted',
      state: 'done',
      children: (
        <>
          <Text size="sm" fw={600} c="dark.8" lh={1.4}>
            {t('journeySubmitted', { name: report.createdBy.name || '—' })}
          </Text>
          <Text size="xs" c="dimmed">
            {formatAssetDate(report.submittedAt)}
          </Text>
        </>
      ),
    },
    decided ?? {
      id: 'waiting',
      state: 'waiting',
      children: (
        <>
          <Text size="sm" fw={600} c="dark.8" lh={1.4}>
            {t('journeyWaiting', { roles })}
          </Text>
          <Text size="xs" c="dimmed">
            {t('stepSignature')}
          </Text>
        </>
      ),
    },
  ];

  return (
    <AssetCard
      icon={IconShieldCheck}
      title={t('approvalTitle')}
      subtitle={waiting ? t('approvalWaiting') : t(`status_${report.status}`)}
    >
      <Stack gap="md">
        <StepTimeline items={steps} />

        {report.status === 'REJECTED' && decider?.note && (
          <Alert color="red" radius="md" title={t('rejectReason')}>
            {decider.note}
          </Alert>
        )}

        {report.canDecide && (
          <Group justify="flex-end" gap="sm">
            <Button
              variant="default"
              radius="md"
              leftSection={<IconX size={16} />}
              onClick={() => setOpen('reject')}
            >
              {t('reject')}
            </Button>
            <Button
              radius="md"
              leftSection={<IconCheck size={16} />}
              onClick={() => setOpen('approve')}
            >
              {t('approve')}
            </Button>
          </Group>
        )}

        {waiting && !report.canDecide && (
          <Text size="xs" c="dimmed">
            {report.createdBy.id === me ? t('ownReportNotice') : t('notYourDecision', { roles })}
          </Text>
        )}
      </Stack>

      {open === 'approve' && <WriteOffApproveModal report={report} onClose={() => setOpen(null)} />}
      {open === 'reject' && <WriteOffRejectModal report={report} onClose={() => setOpen(null)} />}
    </AssetCard>
  );
}

export default WriteOffApprovalCard;
