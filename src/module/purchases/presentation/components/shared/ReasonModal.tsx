import { useState } from 'react';
import { Button, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

const MIN_REASON = 3;

interface ReasonModalProps {
  opened: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  /** `danger` for void, cancel and reject. */
  tone?: 'primary' | 'danger';
  /** Minimum trimmed length when required; defaults to three. */
  optional?: boolean;
  /** Maximum input length; defaults to 500. */
  minLength?: number;
  maxLength?: number;
  label?: string;
  placeholder?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Collects an optional or required reason for a document action. */
export const ReasonModal = ({
  opened,
  title,
  description,
  confirmLabel,
  tone = 'danger',
  optional = false,
  minLength = MIN_REASON,
  maxLength = 500,
  label,
  placeholder,
  loading,
  onClose,
  onConfirm,
}: Readonly<ReasonModalProps>) => {
  const { t } = useTranslation('purchases');
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const close = () => {
    setReason('');
    onClose();
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={close}
      title={title}
      description={description}
      footer={
        <>
          <Button variant="default" onClick={close} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            color={tone === 'danger' ? 'red' : 'primary'}
            loading={loading}
            disabled={!optional && trimmed.length < minLength}
            onClick={() => {
              onConfirm(trimmed);
              setReason('');
            }}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Textarea
        label={label ?? t('shared.reasonLabel')}
        placeholder={placeholder ?? t('shared.reasonPlaceholder')}
        value={reason}
        onChange={(event) => setReason(event.currentTarget.value)}
        minRows={3}
        autosize
        maxLength={maxLength}
        data-autofocus
      />
    </ModalFrame>
  );
};
