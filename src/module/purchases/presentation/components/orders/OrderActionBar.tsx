import { useState } from 'react';
import { Button, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconCircleCheck,
  IconCoins,
  IconDots,
  IconEdit,
  IconFileInvoice,
  IconPackageImport,
  IconPrinter,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { orderActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { downloadOrderPdf } from '@/module/purchases/infrastructure/purchaseApi';
import { OrderDraftModal } from '@/module/purchases/presentation/components/orders/OrderDraftModal';
import { SendOrderDialog } from '@/module/purchases/presentation/components/orders/SendOrderDialog';
import { saveBlob } from '@/module/purchases/presentation/components/orders/saveBlob';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCloseOrder,
  useVoidOrder,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

type Dialog = 'edit' | 'send' | 'close' | 'void' | null;

/** The next step is the only filled button: send a draft, then receive or bill. The rest is secondary. */
export const OrderActionBar = ({ order }: Readonly<{ order: PurchaseOrder }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const describe = usePurchaseErrorMessage();
  const { can } = usePurchaseAccess();
  const close = useCloseOrder();
  const voidOrder = useVoidOrder();
  const [dialog, setDialog] = useState<Dialog>(null);
  const [printing, setPrinting] = useState(false);

  const actions = orderActions(order);
  const canUpdate = can(PURCHASE_MENU.documents, 'update');
  const canCreate = can(PURCHASE_MENU.documents, 'create');
  const showEdit = actions.edit && canUpdate;
  const showSend = actions.send && canUpdate;
  const showReceive = actions.receive && can(PURCHASE_MENU.receipts, 'create');
  const showBill = actions.bill && canCreate;
  const showAdvance = actions.requestAdvance && can(PURCHASE_MENU.paymentRequests, 'create');
  const showClose = actions.close && canUpdate;
  const showVoid = actions.void && can(PURCHASE_MENU.documents, 'delete');
  const closeDialog = () => setDialog(null);

  const print = async () => {
    setPrinting(true);
    try {
      saveBlob(await downloadOrderPdf(order.id), `${order.number}.pdf`);
    } catch (error) {
      notifications.show({ color: 'orange', message: describe(error) });
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      {showEdit && (
        <Button
          variant="default"
          radius="md"
          leftSection={<IconEdit size={16} />}
          onClick={() => setDialog('edit')}
        >
          {t('common.edit')}
        </Button>
      )}
      {showSend && (
        <Button radius="md" leftSection={<IconSend size={16} />} onClick={() => setDialog('send')}>
          {t('orders.detail.send', { label: order.documentLabel })}
        </Button>
      )}
      {showBill && (
        <Button
          radius="md"
          leftSection={<IconFileInvoice size={16} />}
          onClick={() => navigate(`${routes.purchases.billAdd}?order=${order.id}`)}
        >
          {t('orders.detail.createBill')}
        </Button>
      )}
      {showReceive && (
        <Button
          radius="md"
          leftSection={<IconPackageImport size={16} />}
          onClick={() => navigate(`${routes.purchases.receiptAdd}?order=${order.id}`)}
        >
          {t('orders.detail.receive')}
        </Button>
      )}
      <Menu position="bottom-end" withinPortal>
        <Menu.Target>
          <Button
            variant="default"
            radius="md"
            px="xs"
            aria-label={t('common.more')}
            loading={printing}
          >
            <IconDots size={18} />
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            leftSection={<IconPrinter size={14} />}
            onClick={() => {
              print();
            }}
          >
            {t('orders.detail.print')}
          </Menu.Item>
          {showAdvance && (
            <Menu.Item
              leftSection={<IconCoins size={14} />}
              onClick={() => navigate(`${routes.purchases.paymentRequestAdd}?order=${order.id}`)}
            >
              {t('orders.detail.requestAdvance')}
            </Menu.Item>
          )}
          {showClose && (
            <Menu.Item
              leftSection={<IconCircleCheck size={14} />}
              onClick={() => setDialog('close')}
            >
              {t('orders.detail.close', { label: order.documentLabel })}
            </Menu.Item>
          )}
          {showVoid && (
            <Menu.Item
              color="red"
              leftSection={<IconX size={14} />}
              onClick={() => setDialog('void')}
            >
              {t('orders.detail.void', { label: order.documentLabel })}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      <OrderDraftModal order={order} opened={dialog === 'edit'} onClose={closeDialog} />
      <SendOrderDialog order={order} opened={dialog === 'send'} onClose={closeDialog} />
      <ReasonModal
        opened={dialog === 'close'}
        title={t('orders.detail.closeTitle', { label: order.documentLabel })}
        description={t('orders.detail.closeDescription')}
        confirmLabel={t('orders.detail.close', { label: order.documentLabel })}
        tone="primary"
        label={t('orders.detail.closeNote')}
        loading={close.isPending}
        onClose={closeDialog}
        onConfirm={(note) => close.mutate({ id: order.id, note }, { onSuccess: closeDialog })}
      />
      <ReasonModal
        opened={dialog === 'void'}
        title={t('orders.detail.voidTitle', { label: order.documentLabel })}
        description={t('orders.detail.voidDescription')}
        confirmLabel={t('orders.detail.void', { label: order.documentLabel })}
        loading={voidOrder.isPending}
        onClose={closeDialog}
        onConfirm={(reason) =>
          voidOrder.mutate({ id: order.id, reason }, { onSuccess: closeDialog })
        }
      />
    </>
  );
};
