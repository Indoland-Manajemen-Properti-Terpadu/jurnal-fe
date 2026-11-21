import { Alert, Button, List, Text } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { BillVariance } from '@/module/purchases/domain/purchaseDocuments';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface BillVarianceDialogProps {
  variances: BillVariance[] | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/** The bill differs from the order: say by how much and ask before verifying it anyway. */
export const BillVarianceDialog = ({
  variances,
  loading,
  onClose,
  onConfirm,
}: Readonly<BillVarianceDialogProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <ModalFrame
      opened={variances !== null}
      onClose={onClose}
      size="md"
      title={t('bills.variance.title')}
      description={t('bills.variance.description')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('bills.variance.review')}
          </Button>
          <Button loading={loading} onClick={onConfirm}>
            {t('bills.variance.continue')}
          </Button>
        </>
      }
    >
      <Alert color="yellow" variant="light" radius="md" icon={<IconAlertTriangle size={18} />}>
        <List size="sm" spacing={4}>
          {(variances ?? []).map((variance) => (
            <List.Item key={`${variance.type}-${variance.expected}-${variance.actual}`}>
              {t(`bills.variance.${variance.type}`, {
                expected: formatAmount(variance.expected),
                actual: formatAmount(variance.actual),
              })}
            </List.Item>
          ))}
        </List>
      </Alert>
      <Text size="xs" c="dimmed">
        {t('bills.variance.note')}
      </Text>
    </ModalFrame>
  );
};
