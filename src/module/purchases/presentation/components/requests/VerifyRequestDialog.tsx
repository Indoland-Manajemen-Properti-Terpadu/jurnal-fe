import { Button, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

interface VerifyRequestDialogProps {
  opened: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** Accounting confirms a request is in order. There is no note to write: QA asked for it to go (PRO-108). */
export const VerifyRequestDialog = ({
  opened,
  loading,
  onClose,
  onConfirm,
}: Readonly<VerifyRequestDialogProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <ModalFrame
      opened={opened}
      onClose={loading ? () => undefined : onClose}
      title={t('requests.detail.verifyTitle')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button loading={loading} onClick={onConfirm}>
            {t('requests.detail.verify')}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {t('requests.detail.verifyDescription')}
      </Text>
    </ModalFrame>
  );
};
