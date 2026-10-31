import React from 'react';
import { Modal, Group, Stack } from '@mantine/core';

type CustomConfirmModalProps = {
  opened: boolean;
  onClose: () => void;
  size?: string;
  title: React.ReactNode;
  children: React.ReactNode;
  labels: {
    confirm: React.ReactNode;
    cancel: React.ReactNode;
  };
  withCloseButton?: boolean;
};

const CustomConfirmModal: React.FC<CustomConfirmModalProps> = ({
  opened,
  onClose,
  size,
  title,
  children,
  labels,
  withCloseButton = true,
}) => (
  <Modal
    opened={opened}
    onClose={onClose}
    title={title}
    withCloseButton={withCloseButton}
    centered
    size={size}
  >
    <Stack>
      {children}
      <Group justify="flex-end">
        {labels.cancel}
        {labels.confirm}
      </Group>
    </Stack>
  </Modal>
);

export default CustomConfirmModal;
