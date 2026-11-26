import { useState } from 'react';
import { Alert, Button, Group, Stack, Text, Textarea } from '@mantine/core';
import { IconCheck, IconShieldCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  approvalConfirmation,
  approvalStep,
  levelRule,
} from '@/module/purchases/domain/approvalProgress';
import type { ApprovalState } from '@/module/purchases/domain/purchaseCommon';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { ApprovalTrail } from '@/module/purchases/presentation/components/shared/ApprovalTrail';
import { ApprovalConfirmModal } from '@/module/purchases/presentation/components/shared/ApprovalConfirmModal';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';

interface ApprovalPanelProps {
  approval: ApprovalState;
  /** Document status; the panel shows only once the document has entered approval. */
  status: string;
  /** The status that means "waiting for a decision"; PENDING_APPROVAL unless the document says otherwise. */
  waitingStatus?: string;
  /** The user holds the approval right for this document type. */
  canApprove: boolean;
  busy?: boolean;
  onApprove: (note?: string) => void;
  onReject: (reason: string) => void;
  /** Without its own card, to sit inside another card. */
  bare?: boolean;
  /** Only the note and the buttons: the caller already lists who approved and who is next. */
  actionsOnly?: boolean;
}

/** Who still has to approve, who already did, and the approve / reject buttons when allowed. */
export const ApprovalPanel = ({
  approval,
  status,
  waitingStatus = 'PENDING_APPROVAL',
  canApprove,
  busy,
  onApprove,
  onReject,
  bare,
  actionsOnly = false,
}: Readonly<ApprovalPanelProps>) => {
  const { t } = useTranslation('purchases');
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const waiting = status === waitingStatus;
  const rejected = status === 'REJECTED' && approval.rejectionReason;
  if (!waiting && !rejected && approval.entries.length === 0) return null;

  const showActions = waiting && canApprove && approval.canDecide;
  const step = waiting ? approvalStep(approval) : null;
  const rule = step ? levelRule(step.level) : null;
  if (actionsOnly && !showActions) return null;

  const body = (
    <>
      <Stack gap="sm">
        {rejected && !actionsOnly && (
          <Alert color="red" radius="md" title={t('approval.rejectedTitle')}>
            {approval.rejectionReason}
          </Alert>
        )}

        {approval.plan.length > 0 && !actionsOnly && (
          <ApprovalTrail approval={approval} status={status} hideReason />
        )}

        {step && !actionsOnly && (
          <Group gap={6}>
            {step.total > 1 && (
              <Text size="xs" c="dimmed">
                {t('approval.level', { current: step.current, total: step.total })}
              </Text>
            )}
            {step.level.roles.map((role) => (
              <Text key={role.id} size="xs" c={role.approved ? 'green.7' : 'dimmed'} fw={600}>
                {role.approved ? '✓ ' : ''}
                {role.name}
              </Text>
            ))}
            {rule && (
              <Text size="xs" c="dimmed">
                {t(rule === 'all' ? 'approval.levelAll' : 'approval.levelAny')}
              </Text>
            )}
          </Group>
        )}

        {showActions && (
          <>
            <Textarea
              label={t('approval.noteLabel')}
              placeholder={t('approval.notePlaceholder')}
              value={note}
              onChange={(event) => setNote(event.currentTarget.value)}
              minRows={2}
              autosize
              maxLength={300}
            />
            <Group justify="flex-end" gap="sm">
              <Button
                variant="default"
                color="red"
                leftSection={<IconX size={16} />}
                disabled={busy}
                onClick={() => setRejecting(true)}
              >
                {t('approval.reject')}
              </Button>
              <Button
                leftSection={<IconCheck size={16} />}
                loading={busy}
                onClick={() => setConfirming(true)}
              >
                {step && step.total > 1
                  ? t('approval.approveStep', { current: step.current, total: step.total })
                  : t('approval.approve')}
              </Button>
            </Group>
          </>
        )}

        {waiting && !showActions && !actionsOnly && (
          <Text size="xs" c="dimmed">
            {canApprove ? t('approval.notYourTurn') : t('approval.noRight')}
          </Text>
        )}
      </Stack>

      <ApprovalConfirmModal
        opened={confirming}
        confirmation={approvalConfirmation(approval)}
        busy={busy}
        onClose={() => setConfirming(false)}
        onConfirm={() => {
          onApprove(note.trim() || undefined);
          setNote('');
          setConfirming(false);
        }}
      />
      <ReasonModal
        opened={rejecting}
        title={t('approval.rejectTitle')}
        description={t('approval.rejectDescription')}
        confirmLabel={t('approval.reject')}
        loading={busy}
        onClose={() => setRejecting(false)}
        onConfirm={(reason) => {
          onReject(reason);
          setRejecting(false);
        }}
      />
    </>
  );
  if (bare) return body;
  return (
    <SectionCard
      icon={IconShieldCheck}
      title={t('approval.title')}
      subtitle={waiting ? t('approval.waiting') : undefined}
    >
      {body}
    </SectionCard>
  );
};
