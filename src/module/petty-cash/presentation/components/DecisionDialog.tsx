import { useState, type ReactNode } from 'react';
import { Button, Textarea } from '@mantine/core';
import { DialogFrame } from '@/module/petty-cash/presentation/components/DialogFrame';
import { useTranslation } from '@/i18n';

interface Props {
  opened: boolean;
  title: string;
  body?: string;
  /** When given, a reason is asked for and required before the decision can be confirmed. */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  confirmLabel: string;
  confirmColor?: string;
  loading: boolean;
  /** Another field the decision needs (for example a payout date). */
  children?: ReactNode;
  confirmDisabled?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

/** One dialog for every approve, reject, cancel, void or pay-out decision, with an optional required reason. */
export function DecisionDialog({
  opened,
  title,
  body,
  reasonLabel,
  reasonPlaceholder,
  confirmLabel,
  confirmColor = 'primary',
  loading,
  children,
  confirmDisabled = false,
  onClose,
  onConfirm,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);
  const needsReason = reasonLabel !== undefined;
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
    <DialogFrame
      opened={opened}
      onClose={close}
      title={title}
      description={body}
      footer={
        <>
          <Button variant="default" onClick={close} disabled={loading}>
            {t('actions.keep')}
          </Button>
          <Button
            color={confirmColor}
            loading={loading}
            disabled={confirmDisabled}
            onClick={confirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
      {needsReason && (
        <Textarea
          label={reasonLabel}
          placeholder={reasonPlaceholder}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          error={touched && reasonMissing ? t('actions.reasonRequired') : undefined}
          minRows={3}
          autosize
          data-autofocus
          required
        />
      )}
    </DialogFrame>
  );
}
