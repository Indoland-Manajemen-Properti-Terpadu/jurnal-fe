import { useState } from 'react';
import { Alert, Badge, Button, Group, Stack, Text, Textarea, ThemeIcon } from '@mantine/core';
import { IconCheck, IconShieldCheck, IconX } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { ApprovalState } from '@/module/purchases/domain/purchaseCommon';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { Timeline } from '@/module/purchases/presentation/components/shared/Timeline';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';

interface ApprovalPanelProps {
  approval: ApprovalState;
  /** Document status; the panel shows only once the document has entered approval. */
  status: string;
  /** The user holds the approval right for this document type. */
  canApprove: boolean;
  busy?: boolean;
  onApprove: (note?: string) => void;
  onReject: (reason: string) => void;
}

/** Who still has to approve, who already did, and the approve / reject buttons when allowed. */
export const ApprovalPanel = ({
  approval,
  status,
  canApprove,
  busy,
  onApprove,
  onReject,
}: Readonly<ApprovalPanelProps>) => {
  const { t } = useTranslation('purchases');
  const [note, setNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const waiting = status === 'PENDING_APPROVAL';
  const rejected = status === 'REJECTED' && approval.rejectionReason;
  if (!waiting && !rejected && approval.entries.length === 0) return null;

  const showActions = waiting && canApprove && approval.canDecide;

  return (
    <SectionCard
      icon={IconShieldCheck}
      title={t('approval.title')}
      subtitle={waiting ? t('approval.waiting') : undefined}
    >
      <Stack gap="sm">
        {rejected && (
          <Alert color="red" radius="md" title={t('approval.rejectedTitle')}>
            {approval.rejectionReason}
          </Alert>
        )}

        {approval.pending.length > 0 && (
          <Timeline
            items={approval.pending.map((level, index) => ({
              id: String(level.level),
              state: index === 0 ? 'waiting' : 'upcoming',
              children: (
                <>
                  <Text size="sm" fw={600} c={index === 0 ? 'dark.8' : 'dimmed'} lh={1.4}>
                    {level.name}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {index === 0
                      ? level.mode === 'ALL'
                        ? t('approval.modeAll')
                        : t('approval.modeAny')
                      : t('approval.afterPrevious')}
                  </Text>
                  {index === 0 && (
                    <Group gap={6} mt={6}>
                      {level.roles.map((role) => (
                        <Badge
                          key={role.id}
                          variant={role.approved ? 'light' : 'outline'}
                          color={role.approved ? 'green' : 'gray'}
                          radius="sm"
                          leftSection={role.approved ? <IconCheck size={12} /> : undefined}
                        >
                          {role.name}
                        </Badge>
                      ))}
                    </Group>
                  )}
                </>
              ),
            }))}
          />
        )}

        {!waiting && approval.entries.length > 0 && (
          <Group gap="xs">
            <ThemeIcon variant="light" color="primary" size={26} radius="xl">
              <IconCheck size={16} />
            </ThemeIcon>
            <Text size="sm">{t('approval.completed', { count: approval.entries.length })}</Text>
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
                onClick={() => {
                  onApprove(note.trim() || undefined);
                  setNote('');
                }}
              >
                {t('approval.approve')}
              </Button>
            </Group>
          </>
        )}

        {waiting && !showActions && (
          <Text size="xs" c="dimmed">
            {canApprove ? t('approval.notYourTurn') : t('approval.noRight')}
          </Text>
        )}
      </Stack>

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
    </SectionCard>
  );
};
