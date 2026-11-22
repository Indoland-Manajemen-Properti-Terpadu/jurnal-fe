import { useEffect, useState } from 'react';
import { Button, Text, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';

type Props = {
  opened: boolean;
  title: string;
  body: string;
  label: string;
  placeholder?: string;
  required: string;
  confirmLabel: string;
  keepLabel: string;
  saving: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
};

/** Rejecting or cancelling a count needs a reason; the service keeps it in the history. */
export function OpnameReasonDialog({
  opened,
  title,
  body,
  label,
  placeholder,
  required,
  confirmLabel,
  keepLabel,
  saving,
  onConfirm,
  onClose,
}: Readonly<Props>) {
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
      setError(required);
      return;
    }
    setError(null);
    onConfirm(trimmed);
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={saving ? () => undefined : onClose}
      title={title}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {keepLabel}
          </Button>
          <Button color="red" onClick={confirm} loading={saving}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {body}
      </Text>
      <Textarea
        label={label}
        placeholder={placeholder}
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
