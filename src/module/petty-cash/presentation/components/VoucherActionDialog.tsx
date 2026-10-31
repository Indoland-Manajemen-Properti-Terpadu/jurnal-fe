import { useState } from 'react';
import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';

export type VoucherDialogKind = 'approve' | 'reject' | 'void';

interface Props {
  kind: VoucherDialogKind | null;
  voucherNumber: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

/** Confirms approve, and asks for a reason before reject or void (both are recorded in the audit log). */
export function VoucherActionDialog({
  kind,
  voucherNumber,
  loading,
  onClose,
  onConfirm,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const needsReason = kind === 'reject' || kind === 'void';
  const reasonMissing = needsReason && reason.trim() === '';

  const close = () => {
    setReason('');
    setTouched(false);
    onClose();
  };

  const confirm = () => {
    if (reasonMissing) {
      setTouched(true);
      return;
    }
    onConfirm(needsReason ? reason.trim() : undefined);
  };

  return (
    <Modal
      opened={kind !== null}
      onClose={close}
      centered
      radius="md"
      title={
        kind ? <Text fw={700}>{t(`actions.${kind}Title`, { number: voucherNumber })}</Text> : null
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      {kind && (
        <Stack gap="md">
          {kind === 'approve' && <Text size="sm">{t('actions.approveBody')}</Text>}
          {kind === 'void' && <Text size="sm">{t('actions.voidBody')}</Text>}
          {needsReason && (
            <Textarea
              label={t(kind === 'reject' ? 'actions.rejectReason' : 'actions.voidReason')}
              placeholder={t(
                kind === 'reject'
                  ? 'actions.rejectReasonPlaceholder'
                  : 'actions.voidReasonPlaceholder'
              )}
              value={reason}
              onChange={(event) => setReason(event.currentTarget.value)}
              error={touched && reasonMissing ? t('actions.reasonRequired') : undefined}
              minRows={3}
              autosize
              data-autofocus
              required
            />
          )}
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={close} disabled={loading}>
              {t('actions.keep')}
            </Button>
            <Button
              color={kind === 'approve' ? 'primary' : 'red'}
              loading={loading}
              onClick={confirm}
            >
              {t(`actions.${kind}`)}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
