import { Button, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
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
    <ModalFrame
      opened={opened}
      onClose={onClose}
      title={title}
      footer={
        <>
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
        </>
      }
    >
      <Text size="sm" c="dimmed">
        {message}
      </Text>
    </ModalFrame>
  );
};
