import { Button, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { ApprovalConfirmation } from '@/module/purchases/domain/approvalProgress';

interface ApprovalConfirmModalProps {
  opened: boolean;
  /** What this approval does; null when it is a plain one-level approval. */
  confirmation: ApprovalConfirmation | null;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

/** The question before an approval counts: which approval this is out of how many, and who is next. */
export const ApprovalConfirmModal = ({
  opened,
  confirmation,
  busy,
  onConfirm,
  onClose,
}: Readonly<ApprovalConfirmModalProps>) => {
  const { t } = useTranslation('purchases');
  const several = confirmation !== null && confirmation.total > 1;
  const body = (() => {
    if (!confirmation || !several) return t('approval.confirm.single');
    if (confirmation.outcome === 'final') return t('approval.confirm.final');
    if (confirmation.outcome === 'sameLevel') return t('approval.confirm.sameLevel');
    return t('approval.confirm.next', { name: confirmation.next ?? '' });
  })();

  return (
    <ModalFrame
      opened={opened}
      onClose={busy ? () => undefined : onClose}
      title={
        several
          ? t('approval.confirm.title', {
              current: confirmation.current,
              total: confirmation.total,
            })
          : t('approval.confirm.titleSingle')
      }
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={busy}>
            {t('approval.confirm.back')}
          </Button>
          <Button onClick={onConfirm} loading={busy}>
            {t('approval.confirm.yes')}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {body}
      </Text>
    </ModalFrame>
  );
};
