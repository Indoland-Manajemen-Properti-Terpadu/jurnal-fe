import { useState } from 'react';
import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';

const MIN_REASON = 3;

interface ReasonModalProps {
  opened: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Voiding an invoice needs a reason of at least three characters. */
export const ReasonModal = ({
  opened,
  title,
  description,
  confirmLabel,
  loading,
  onClose,
  onConfirm,
}: Readonly<ReasonModalProps>) => {
  const { t } = useTranslation('sales');
  const [reason, setReason] = useState('');
  const trimmed = reason.trim();
  const close = () => {
    setReason('');
    onClose();
  };

  return (
    <Modal opened={opened} onClose={close} title={title} centered radius="lg">
      <Stack gap="md">
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
        <Textarea
          label={t('reason.label')}
          placeholder={t('reason.placeholder')}
          value={reason}
          onChange={(event) => setReason(event.currentTarget.value)}
          minRows={3}
          autosize
          maxLength={500}
          data-autofocus
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={close} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            color="red"
            loading={loading}
            disabled={trimmed.length < MIN_REASON}
            onClick={() => {
              onConfirm(trimmed);
              setReason('');
            }}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
