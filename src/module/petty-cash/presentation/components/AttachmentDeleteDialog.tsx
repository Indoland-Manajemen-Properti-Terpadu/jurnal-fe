import { Button, Group, Modal, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

interface Props {
  fileName: string | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Deleting a receipt is final and not logged, so it always asks first. */
export function AttachmentDeleteDialog({ fileName, loading, onClose, onConfirm }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');

  return (
    <Modal
      opened={fileName !== null}
      onClose={onClose}
      centered
      radius="md"
      title={
        fileName ? (
          <Text fw={700}>{t('actions.deleteAttachmentTitle', { name: fileName })}</Text>
        ) : null
      }
      closeButtonProps={{ 'aria-label': t('common.close') }}
    >
      <Stack gap="md">
        <Text size="sm">{t('actions.deleteAttachmentBody')}</Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('actions.keep')}
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm} data-autofocus>
            {t('actions.deleteAttachmentConfirm')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
