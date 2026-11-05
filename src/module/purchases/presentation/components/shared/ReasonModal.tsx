import { useState } from 'react';
import { Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';

const MIN_REASON = 3;

interface ReasonModalProps {
  opened: boolean;
  title: string;
  description?: string;
  confirmLabel: string;
  /** `danger` for void, cancel and reject. */
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Rejecting, cancelling and voiding all need a reason of at least three characters. */
export const ReasonModal = ({
  opened,
  title,
  description,
  confirmLabel,
  tone = 'danger',
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
    <Modal opened={opened} onClose={close} title={title} centered radius="lg">
      <Stack gap="md">
        {description && (
          <Text size="sm" c="dimmed">
            {description}
          </Text>
        )}
        <Textarea
          label={t('shared.reasonLabel')}
          placeholder={t('shared.reasonPlaceholder')}
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
            color={tone === 'danger' ? 'red' : 'primary'}
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
