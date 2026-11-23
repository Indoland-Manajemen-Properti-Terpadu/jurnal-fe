import { Button, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

type Props = {
  opened: boolean;
  number: string;
  fromName: string;
  toName: string;
  productCount: number;
  saving: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/** Approving is what moves the stock, so it asks once and says exactly what will happen. */
export function ApproveTransferDialog({
  opened,
  number,
  fromName,
  toName,
  productCount,
  saving,
  onConfirm,
  onClose,
}: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  return (
    <ModalFrame
      opened={opened}
      onClose={saving ? () => undefined : onClose}
      title={t('detail.approveTitle', { number })}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t('detail.voidKeep')}
          </Button>
          <Button color="primary" onClick={onConfirm} loading={saving}>
            {t('detail.approveConfirm')}
          </Button>
        </>
      }
    >
      <Text size="sm" c="dimmed" lh={1.6}>
        {t('detail.approveBody', { count: productCount, from: fromName, to: toName })}
      </Text>
    </ModalFrame>
  );
}
