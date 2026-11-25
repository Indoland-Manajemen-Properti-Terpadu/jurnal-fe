import { useEffect, useState } from 'react';
import { Button, Text, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

type Props = {
  opened: boolean;
  /** `withdraw` is for a request that still waits for approval; no stock was moved yet. */
  mode?: 'cancel' | 'withdraw';
  number: string;
  /** The warehouse the stock goes back to. */
  fromName: string;
  saving: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

/** Cancelling or withdrawing a transfer needs a reason; the service keeps it with the document. */
export function VoidTransferDialog({
  opened,
  mode = 'cancel',
  number,
  fromName,
  saving,
  onConfirm,
  onClose,
}: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  // Withdrawing a waiting request has its own words: nothing was posted, so nothing is reversed.
  const k = mode === 'withdraw' ? 'withdraw' : 'void';

  useEffect(() => {
    if (opened) {
      setReason('');
      setError(null);
    }
  }, [opened]);

  const confirm = () => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setError(t(`detail.${k}ReasonRequired`));
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={saving ? () => undefined : onClose}
      title={t(`detail.${k}Title`, { number })}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t('detail.voidKeep')}
          </Button>
          <Button color="red" onClick={confirm} loading={saving}>
            {t(`detail.${k}Confirm`)}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {t(`detail.${k}Body`, { from: fromName })}
      </Text>
      <Textarea
        label={t(`detail.${k}ReasonLabel`)}
        placeholder={t(`detail.${k}ReasonPlaceholder`)}
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
