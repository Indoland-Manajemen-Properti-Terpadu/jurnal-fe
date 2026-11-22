import { useEffect, useState } from 'react';
import { Button, Text, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

type Props = {
  opened: boolean;
  number: string;
  /** The warehouse the stock goes back to. */
  fromName: string;
  saving: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

/** Cancelling a transfer needs a reason; the service keeps it with the document. */
export function VoidTransferDialog({
  opened,
  number,
  fromName,
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
      setError(t('detail.voidReasonRequired'));
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={saving ? () => undefined : onClose}
      title={t('detail.voidTitle', { number })}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t('detail.voidKeep')}
          </Button>
          <Button color="red" onClick={confirm} loading={saving}>
            {t('detail.voidConfirm')}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {t('detail.voidBody', { from: fromName })}
      </Text>
      <Textarea
        label={t('detail.voidReasonLabel')}
        placeholder={t('detail.voidReasonPlaceholder')}
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
