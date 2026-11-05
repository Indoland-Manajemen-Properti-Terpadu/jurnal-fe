import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  /** `danger` for deleting; `primary` for issuing an invoice. */
  tone?: 'primary' | 'danger';
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const ConfirmModal = ({
  opened,
  title,
  message,
  confirmLabel,
  tone = 'primary',
  loading,
  onClose,
  onConfirm,
}: Readonly<ConfirmModalProps>) => {
  const { t } = useTranslation('sales');
  return (
    <Modal opened={opened} onClose={onClose} title={title} centered radius="lg">
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {message}
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button
            color={tone === 'danger' ? 'red' : 'primary'}
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
