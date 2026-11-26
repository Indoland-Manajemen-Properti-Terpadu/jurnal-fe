import { useState } from 'react';
import { Alert, Anchor, Button, Group, Stack, Text } from '@mantine/core';
import { IconRepeat } from '@tabler/icons-react';
import { useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import {
  approveReorder,
  rejectReorder,
} from '@/module/purchases/infrastructure/purchaseReorderApi';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

export const OrderReorderApprovalCard = ({ order }: Readonly<{ order: PurchaseOrder }>) => {
  const { t } = useTranslation('purchases');
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const describe = usePurchaseErrorMessage();
  const [rejecting, setRejecting] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (!order.reorder && !order.reorderedOrders.length) return null;
  const refresh = () => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) });
  const decide = async (action: 'approve' | 'reject', reason?: string) => {
    if (order.approvalStage === null) return;
    setBusy(true);
    setError(null);
    try {
      if (action === 'approve') await approveReorder(order.id, order.approvalStage);
      else await rejectReorder(order.id, order.approvalStage, reason ?? '');
      setRejecting(false);
      await refresh();
    } catch (cause) {
      setError(describe(cause));
      await refresh();
    } finally {
      setBusy(false);
    }
  };
  return (
    <>
      <SectionCard icon={IconRepeat} title={t('orders.reorder.approval')}>
        <Stack p="lg" gap="sm">
          {order.reorderSourceRef && (
            <Text size="sm">
              {t('orders.reorder.source')}:{' '}
              <Anchor
                component={Link}
                to={routes.purchases.orderDetail.replace(':id', order.reorderSourceRef.id)}
              >
                {order.reorderSourceRef.number}
              </Anchor>
            </Text>
          )}
          {order.reorder && (
            <Text size="sm">
              {t('orders.reorder.oldTotal')}: {formatAmount(order.reorder.sourceTotal)} ·{' '}
              {t('orders.reorder.newTotal')}: {formatAmount(order.finalAmount)}
            </Text>
          )}
          {order.reorder?.note && <Text size="sm">{order.reorder.note}</Text>}
          {order.approvalPlan.map((stage, index) => (
            <div key={`${stage.name}-${index}`}>
              <Text size="sm" fw={600}>
                {index + 1}. {stage.name} · {stage.mode}
              </Text>
              <Text size="xs" c="dimmed">
                {stage.roles.map((role) => role.name).join(', ')}
              </Text>
            </div>
          ))}
          {order.pendingApprovers.map((stage) => (
            <Text key={stage.level} size="sm">
              {stage.name}:{' '}
              {stage.roles.map((role) => `${role.name}${role.approved ? ' ✓' : ''}`).join(', ')}
            </Text>
          ))}
          {order.rejectionReason && (
            <Alert color="red" title={t('orders.reorder.rejectionReason')}>
              {order.rejectionReason}
            </Alert>
          )}
          {error && <Alert color="red">{error}</Alert>}
          {order.status === 'PENDING_APPROVAL' &&
            order.canDecide &&
            order.approvalStage !== null && (
              <Group justify="flex-end">
                <Button variant="default" color="red" onClick={() => setRejecting(true)}>
                  {t('orders.reorder.reject')}
                </Button>
                <Button loading={busy} onClick={() => decide('approve')}>
                  {t('orders.reorder.approve')}
                </Button>
              </Group>
            )}
          {order.reorderedOrders.length > 0 && (
            <Stack gap={4}>
              <Text size="sm" fw={600}>
                {t('orders.reorder.reorderedIn')}
              </Text>
              {order.reorderedOrders.map((ref) => (
                <Anchor
                  key={ref.id}
                  component={Link}
                  size="sm"
                  to={routes.purchases.orderDetail.replace(':id', ref.id)}
                >
                  {ref.number}
                </Anchor>
              ))}
            </Stack>
          )}
        </Stack>
      </SectionCard>
      <ReasonModal
        opened={rejecting}
        onClose={() => setRejecting(false)}
        title={t('orders.reorder.reject')}
        confirmLabel={t('orders.reorder.reject')}
        loading={busy}
        onConfirm={(reason) => decide('reject', reason)}
      />
    </>
  );
};
