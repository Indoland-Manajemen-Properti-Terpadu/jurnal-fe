import React from 'react';
import { Box, Button, CloseButton, Group, Image, Modal, Stack, Text } from '@mantine/core';
import { IconTrash } from '@tabler/icons-react';
import deleteModalImage from '@/assets/img/vectors/delete_modal.svg';

import type { ConfirmModalProps } from './ConfirmModal.types';

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  opened,
  onClose,
  onConfirm,
  title,
  message,
  helperText,
  imageSrc = deleteModalImage,
  imageAlt = 'Delete illustration',
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  confirmLoading = false,
  size = 'md',
  withCloseButton = true,
  confirmButtonProps,
  cancelButtonProps,
  onCancel,
}) => {
  const modalTitle =
    typeof title === 'string' ? (
      <Text fw={600} size="lg" c="dark.9">
        {title}
      </Text>
    ) : (
      title
    );

  const handleCancel = onCancel ?? onClose;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={null}
      withCloseButton={false}
      centered
      size={size}
      radius="md"
      padding="0"
      styles={{
        inner: { padding: 0 },
        section: { padding: 0 },
        content: { padding: 0, '--modal-padding': '0px' } as React.CSSProperties,
        body: { padding: 0 },
      }}
    >
      <Box
        bg="light"
        px="lg"
        py="sm"
        style={{
          borderBottom: '1px solid var(--mantine-color-gray-2)',
          marginTop: 'calc(var(--mantine-spacing-md) * -1)',
          marginBottom: 'calc(var(--mantine-spacing-md) * -1)',
          marginLeft: 'calc(var(--mantine-spacing-md) * -1)',
          marginRight: 'calc(var(--mantine-spacing-md) * -1)',
        }}
      >
        <Group justify="space-between" align="center">
          {modalTitle}
          {withCloseButton ? <CloseButton onClick={onClose} /> : null}
        </Group>
      </Box>
      <Stack gap="md" align="center" px="lg" py="lg">
        <Image src={imageSrc} alt={imageAlt} fit="contain" w="48%" />
        <Stack gap={4} align="center">
          <Text ta="center" fw={600} c="dark.9">
            {message}
          </Text>
          {helperText ? (
            <Text ta="center" size="sm" c="gray.6">
              {helperText}
            </Text>
          ) : null}
        </Stack>
      </Stack>
      <Box
        bg="light"
        px="lg"
        py="sm"
        style={{
          borderTop: '1px solid var(--mantine-color-gray-2)',
          marginLeft: 'calc(var(--mantine-spacing-md) * -1)',
          marginRight: 'calc(var(--mantine-spacing-md) * -1)',
          marginBottom: 'calc(var(--mantine-spacing-md) * -0.8)',
        }}
      >
        <Group grow w="100%">
          <Button variant="outline" color="gray" onClick={handleCancel} {...cancelButtonProps}>
            {cancelLabel}
          </Button>
          <Button
            color="red.6"
            leftSection={<IconTrash size={18} />}
            loading={confirmLoading}
            onClick={onConfirm}
            {...confirmButtonProps}
          >
            {confirmLabel}
          </Button>
        </Group>
      </Box>
    </Modal>
  );
};

export default ConfirmModal;
