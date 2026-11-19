import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { SaleOrder } from '@/module/sales/domain/saleOrder';
import { ConfirmModal } from '../components/shared/ConfirmModal';
import { ReasonModal } from '../components/shared/ReasonModal';
import {
  useCancelOrder,
  useConfirmOrder,
  useDeleteOrder,
  useDuplicateOrder,
  useSendOrder,
} from './useOrderMutations';

type Kind = 'delete' | 'send' | 'confirm' | 'cancel';

export interface OrderHandlers {
  onView: (order: SaleOrder) => void;
  onEdit: (order: SaleOrder) => void;
  onSend: (order: SaleOrder) => void;
  onConfirm: (order: SaleOrder) => void;
  onCancel: (order: SaleOrder) => void;
  onDelete: (order: SaleOrder) => void;
  onDuplicate: (order: SaleOrder) => void;
  onCreateInvoice: (order: SaleOrder) => void;
  onViewInvoice: (order: SaleOrder) => void;
}

export const orderDetailPath = (id: string) => routes.sales.orderDetail.replace(':id', id);
const editPath = (id: string) => routes.sales.orderEdit.replace(':id', id);

/**
 * The actions of an order with the dialogs they need, for the list rows and the detail page
 * alike. `onDeleted` lets a page that is open on the order leave it once it is gone.
 */
export function useOrderActions(options: { onDeleted?: () => void } = {}): {
  handlers: OrderHandlers;
  dialogs: ReactNode;
} {
  const navigate = useNavigate();
  const { t } = useTranslation('salesOrders');
  const [pending, setPending] = useState<{ kind: Kind; order: SaleOrder } | null>(null);
  const close = () => setPending(null);

  const deleteMutation = useDeleteOrder();
  const sendMutation = useSendOrder();
  const confirmMutation = useConfirmOrder();
  const cancelMutation = useCancelOrder();
  const duplicateMutation = useDuplicateOrder();

  const open = (kind: Kind) => (order: SaleOrder) => setPending({ kind, order });
  const order = pending?.order ?? null;
  const number = order?.transactionNumber ?? '';
  const run = async (action: Promise<unknown>) => {
    await action.catch(() => undefined);
    close();
  };

  const handlers: OrderHandlers = {
    onView: (o) => navigate(orderDetailPath(o.id)),
    onEdit: (o) => navigate(editPath(o.id)),
    onSend: open('send'),
    onConfirm: open('confirm'),
    onCancel: open('cancel'),
    onDelete: open('delete'),
    onDuplicate: async (o) => {
      const copy = await duplicateMutation.mutateAsync(o.id).catch(() => null);
      if (copy) navigate(orderDetailPath(copy.id));
    },
    onCreateInvoice: (o) => navigate(`${routes.sales.add}?order=${o.id}`),
    onViewInvoice: (o) => o.sale && navigate(routes.sales.detail.replace(':id', o.sale)),
  };

  const dialogs = (
    <>
      <ConfirmModal
        opened={pending?.kind === 'delete'}
        tone="danger"
        loading={deleteMutation.isPending}
        title={t('confirm.deleteTitle')}
        message={t('confirm.deleteMessage', { number })}
        confirmLabel={t('confirm.deleteConfirm')}
        onClose={close}
        onConfirm={() =>
          order &&
          run(
            deleteMutation.mutateAsync(order.id).then(() => {
              options.onDeleted?.();
            })
          )
        }
      />
      <ConfirmModal
        opened={pending?.kind === 'send'}
        loading={sendMutation.isPending}
        title={t('confirm.sendTitle', { number })}
        message={t('confirm.sendMessage')}
        confirmLabel={t('confirm.sendConfirm')}
        onClose={close}
        onConfirm={() => order && run(sendMutation.mutateAsync(order.id))}
      />
      <ConfirmModal
        opened={pending?.kind === 'confirm'}
        loading={confirmMutation.isPending}
        title={t('confirm.confirmTitle', { number })}
        message={t('confirm.confirmMessage')}
        confirmLabel={t('confirm.confirmConfirm')}
        onClose={close}
        onConfirm={() => order && run(confirmMutation.mutateAsync(order.id))}
      />
      <ReasonModal
        opened={pending?.kind === 'cancel'}
        loading={cancelMutation.isPending}
        title={t('confirm.cancelTitle', { number })}
        description={t('confirm.cancelDescription')}
        confirmLabel={t('confirm.cancelConfirm')}
        onClose={close}
        onConfirm={(reason) => order && run(cancelMutation.mutateAsync({ id: order.id, reason }))}
      />
    </>
  );

  return { handlers, dialogs };
}
