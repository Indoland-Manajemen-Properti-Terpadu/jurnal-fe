import type React from 'react';
import type { ButtonProps, ModalProps } from '@mantine/core';

export interface ConfirmModalProps {
  opened: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: React.ReactNode;
  message: React.ReactNode;
  helperText?: React.ReactNode;
  imageSrc?: string;
  imageAlt?: string;
  confirmLabel?: React.ReactNode;
  cancelLabel?: React.ReactNode;
  confirmLoading?: boolean;
  size?: ModalProps['size'];
  withCloseButton?: boolean;
  confirmButtonProps?: ButtonProps;
  cancelButtonProps?: ButtonProps;
  onCancel?: () => void;
}
