import type { ReactNode } from 'react';
import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

interface DeleteConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  title: ReactNode;
  onConfirm: () => void;
  loading: boolean;
  children: ReactNode;
}

export function DeleteConfirmModal({
  opened,
  onClose,
  title,
  onConfirm,
  loading,
  children,
}: DeleteConfirmModalProps) {
  const { t: st } = useTranslation('settings');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={700}>{title}</Text>}
      radius="md"
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm">{children}</Text>
        <Group justify="flex-end" gap="xs">
          <Button variant="default" onClick={onClose}>
            {st('common.cancel')}
          </Button>
          <Button color="red" onClick={onConfirm} loading={loading}>
            {st('common.yesDelete')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}

export default DeleteConfirmModal;
