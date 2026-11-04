import { Button, Stack, Text } from '@mantine/core';
import { DialogFrame } from '@/module/petty-cash/presentation/components/DialogFrame';
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
    <DialogFrame
      opened={fileName !== null}
      onClose={onClose}
      title={fileName ? t('actions.deleteAttachmentTitle', { name: fileName }) : ''}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('actions.keep')}
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm} data-autofocus>
            {t('actions.deleteAttachmentConfirm')}
          </Button>
        </>
      }
    >
      <Stack gap="md">
        <Text size="sm">{t('actions.deleteAttachmentBody')}</Text>
      </Stack>
    </DialogFrame>
  );
}
