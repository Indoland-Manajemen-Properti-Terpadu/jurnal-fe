import { useState } from 'react';
import { Button, Group, Menu, Modal, Stack, Text } from '@mantine/core';
import {
  IconCircleCheck,
  IconDots,
  IconEdit,
  IconFileInvoice,
  IconPackageImport,
  IconPrinter,
  IconSend,
  IconX,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { orderActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { downloadOrderPdf } from '@/module/purchases/infrastructure/purchaseApi';
import { saveBlob } from '@/module/purchases/presentation/components/orders/saveBlob';
import { ReasonModal } from '@/module/purchases/presentation/components/shared/ReasonModal';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import {
  useCloseOrder,
  useSubmitOrder,
  useVoidOrder,
} from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { routes } from '@/router/routes';

/** The next step of the flow is the only filled button; the rest are secondary or in the menu. */
export const OrderActionBar = ({ order }: Readonly<{ order: PurchaseOrder }>) => {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const describe = usePurchaseErrorMessage();
  const { can } = usePurchaseAccess();
  const submit = useSubmitOrder();
  const close = useCloseOrder();
  const voidOrder = useVoidOrder();
  const [closing, setClosing] = useState(false);
  const [voiding, setVoiding] = useState(false);
  const [printing, setPrinting] = useState(false);

  const actions = orderActions(order);
  const canUpdate = can(PURCHASE_MENU.documents, 'update');
  const canCreate = can(PURCHASE_MENU.documents, 'create');
  const showEdit = actions.edit && canUpdate;
  const showSubmit = actions.submit && canUpdate;
  const showReceive = actions.receive && canCreate;
  const showBill = actions.billable && canCreate;
  const showClose = actions.close && canUpdate;
  const showVoid = actions.void && can(PURCHASE_MENU.documents, 'delete');

  const receivePrimary = showReceive && !showSubmit;
  const billPrimary = showBill && !showSubmit && !receivePrimary;

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
          onClick={() => navigate(routes.purchases.orderEdit.replace(':id', order.id))}
        >
          {t('common.edit')}
        </Button>
      )}
      {showSubmit && (
        <Button
          radius="md"
          leftSection={<IconSend size={16} />}
          loading={submit.isPending}
          onClick={() => submit.mutate({ id: order.id })}
        >
          {order.status === 'REJECTED' ? t('requests.detail.resubmit') : t('common.submit')}
        </Button>
      )}
      {showBill && (
        <Button
          variant={billPrimary ? 'filled' : 'default'}
          radius="md"
          leftSection={<IconFileInvoice size={16} />}
          onClick={() => navigate(`${routes.purchases.billAdd}?order=${order.id}`)}
        >
          {t('orders.detail.createBill')}
        </Button>
      )}
      {showReceive && (
        <Button
          variant={receivePrimary ? 'filled' : 'default'}
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
          {showClose && (
            <Menu.Item leftSection={<IconCircleCheck size={14} />} onClick={() => setClosing(true)}>
              {t('orders.detail.close')}
            </Menu.Item>
          )}
          {showVoid && (
            <Menu.Item
              color="red"
              leftSection={<IconX size={14} />}
              onClick={() => setVoiding(true)}
            >
              {t('orders.detail.void')}
            </Menu.Item>
          )}
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={closing}
        onClose={() => setClosing(false)}
        title={t('orders.detail.closeTitle')}
        centered
        radius="lg"
      >
        <Stack gap="md">
          <Text size="sm" c="dimmed">
            {t('orders.detail.closeDescription')}
          </Text>
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={() => setClosing(false)} disabled={close.isPending}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={close.isPending}
              onClick={() => close.mutate({ id: order.id }, { onSuccess: () => setClosing(false) })}
            >
              {t('orders.detail.close')}
            </Button>
          </Group>
        </Stack>
      </Modal>
      <ReasonModal
        opened={voiding}
        title={t('orders.detail.voidTitle')}
        description={t('orders.detail.voidDescription')}
        confirmLabel={t('orders.detail.void')}
        loading={voidOrder.isPending}
        onClose={() => setVoiding(false)}
        onConfirm={(reason) =>
          voidOrder.mutate({ id: order.id, reason }, { onSuccess: () => setVoiding(false) })
        }
      />
    </>
  );
};
