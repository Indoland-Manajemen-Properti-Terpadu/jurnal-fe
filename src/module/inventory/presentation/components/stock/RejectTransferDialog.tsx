import { useEffect, useState } from 'react';
import { Button, Text, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

type Props = {
  opened: boolean;
  number: string;
  saving: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

/** Refusing a transfer needs a reason; the person who asked for it reads it on the document. */
export function RejectTransferDialog({
  opened,
  number,
  saving,
  onConfirm,
  onClose,
}: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (opened) {
      setReason('');
      setError(null);
    }
  }, [opened]);

  const confirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError(t('detail.rejectReasonRequired'));
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={saving ? () => undefined : onClose}
      title={t('detail.rejectTitle', { number })}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t('detail.voidKeep')}
          </Button>
          <Button color="red" onClick={confirm} loading={saving}>
            {t('detail.rejectConfirm')}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {t('detail.rejectBody')}
      </Text>
      <Textarea
        label={t('detail.rejectReasonLabel')}
        placeholder={t('detail.rejectReasonPlaceholder')}
        value={reason}
        onChange={(event) => {
          setReason(event.currentTarget.value);
          setError(null);
        }}
        error={error}
        autosize
        minRows={2}
        maxRows={5}
        data-autofocus
      />
    </ModalFrame>
  );
}
