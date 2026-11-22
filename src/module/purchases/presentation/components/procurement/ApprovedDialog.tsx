import { Button, Stack, Text } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { OrderRef } from '@/module/purchases/domain/procurement';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';

interface ApprovedDialogProps {
  orders: OrderRef[] | null;
  onClose: () => void;
}

/** Shown after the last approval: the orders are already drafted, Accounting sends them from the detail. */
export const ApprovedDialog = ({ orders, onClose }: Readonly<ApprovedDialogProps>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const first = orders?.[0];
  return (
    <ModalFrame
      opened={orders !== null}
      onClose={onClose}
      size="md"
      title={t('procurement.approvedTitle')}
      footer={
        <>
          <Button variant="default" onClick={onClose}>
            {t('common.close')}
          </Button>
          {first && (
            <Button onClick={() => navigate(detailPath('order', first.id))}>
              {t('procurement.viewOrder', { count: orders?.length ?? 0 })}
            </Button>
          )}
        </>
      }
    >
      <Stack align="center" gap="xs" py="sm">
        <IconCircleCheck size={40} stroke={1.5} color="var(--mantine-color-green-6)" />
        <Text size="sm" ta="center">
          {t('procurement.approvedBody', { count: orders?.length ?? 0 })}
        </Text>
      </Stack>
    </ModalFrame>
  );
};
