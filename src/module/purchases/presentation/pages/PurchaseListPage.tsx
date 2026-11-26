import { useState, type ReactNode } from 'react';
import { ActionIcon, Button, Menu, Paper, Skeleton, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconArrowBackUp,
  IconFileText,
  IconLock,
  IconPackage,
  IconPlus,
  IconRepeat,
  IconReceipt2,
  IconRefresh,
  IconTruckDelivery,
  IconWallet,
  type Icon,
} from '@tabler/icons-react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { canReadTab, type ListTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import { BillList } from '@/module/purchases/presentation/components/lists/BillList';
import { OrderList } from '@/module/purchases/presentation/components/lists/OrderList';
import { PaymentRequestList } from '@/module/purchases/presentation/components/lists/PaymentRequestList';
import { ReceiptList } from '@/module/purchases/presentation/components/lists/ReceiptList';
import { RequestList } from '@/module/purchases/presentation/components/lists/RequestList';
import { ReturnList } from '@/module/purchases/presentation/components/lists/ReturnList';
import { OrderPickerDialog } from '@/module/purchases/presentation/components/receipts/OrderPickerDialog';
import { ReorderDialog } from '@/module/purchases/presentation/components/orders/ReorderDialog';
import { BillPickerDialog } from '@/module/purchases/presentation/components/returns/BillPickerDialog';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

interface ListPageConfig {
  icon: Icon;
  list: () => ReactNode;
  /** Only the first and last steps of the chain start from scratch; the others follow a document. */
  create?: {
    labelKey: string;
    path: string;
    menu: 'request' | 'paymentRequests' | 'documents' | 'returns' | 'receipts';
  };
}

const PAGES: Record<ListTab, ListPageConfig> = {
  requests: {
    icon: IconFileText,
    list: () => <RequestList />,
    create: { labelKey: 'hub.createRequest', path: routes.purchases.requestAdd, menu: 'request' },
  },
  orders: { icon: IconPackage, list: () => <OrderList /> },
  receipts: {
    icon: IconTruckDelivery,
    list: () => <ReceiptList />,
    create: { labelKey: 'hub.createReceipt', path: 'orderPicker', menu: 'receipts' },
  },
  bills: {
    icon: IconReceipt2,
    list: () => <BillList />,
    create: { labelKey: 'hub.createBill', path: routes.purchases.billAdd, menu: 'documents' },
  },
  payments: {
    icon: IconWallet,
    list: () => <PaymentRequestList />,
    create: {
      labelKey: 'paymentRequests.list.create',
      path: routes.purchases.paymentRequestAdd,
      menu: 'paymentRequests',
    },
  },
  returns: {
    icon: IconArrowBackUp,
    list: () => <ReturnList />,
    create: { labelKey: 'hub.createReturn', path: 'billPicker', menu: 'returns' },
  },
};

interface PurchaseListPageProps {
  tab: ListTab;
}

/** One document list of the purchasing chain on its own page, opened from the sidebar. */
export default function PurchaseListPage({ tab }: Readonly<PurchaseListPageProps>) {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const client = useQueryClient();
  const access = usePurchaseAccess();
  const scope = usePurchaseScope();
  const fetching = useIsFetching({ queryKey: purchaseKeys.all(scope) }) > 0;
  const [picking, setPicking] = useState<'billPicker' | 'orderPicker' | null>(null);
  const [reordering, setReordering] = useState(false);
  const config = PAGES[tab];
  const { create } = config;
  const canCreate = create ? access.can(PURCHASE_MENU[create.menu], 'create') : false;
  const canCreateOrder = tab === 'orders' && access.can(PURCHASE_MENU.documents, 'create');
  const allowed = canReadTab(tab, access.can);

  return (
    <PageFrame
      icon={config.icon}
      title={t(`hub.pages.${tab}.title`)}
      description={t(`hub.pages.${tab}.description`)}
      actions={
        <>
          <Tooltip label={t('hub.refresh')}>
            <ActionIcon
              variant="default"
              size="lg"
              radius="md"
              aria-label={t('hub.refresh')}
              onClick={() => client.invalidateQueries({ queryKey: purchaseKeys.all(scope) })}
              loading={fetching}
            >
              <IconRefresh size={18} />
            </ActionIcon>
          </Tooltip>
          {create && canCreate && (
            <Button
              radius="md"
              leftSection={<IconPlus size={16} />}
              onClick={() =>
                create.path === 'billPicker' || create.path === 'orderPicker'
                  ? setPicking(create.path)
                  : navigate(create.path)
              }
            >
              {t(create.labelKey)}
            </Button>
          )}
          {canCreateOrder && (
            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <Button radius="md" leftSection={<IconPlus size={16} />}>
                  {t('orders.reorder.createOrder')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconPackage size={16} />}
                  onClick={() => navigate(routes.purchases.requests)}
                >
                  {t('orders.reorder.newOrder')}
                  <Text size="xs" c="dimmed">
                    {t('orders.reorder.newOrderHint')}
                  </Text>
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconRepeat size={16} />}
                  onClick={() => setReordering(true)}
                >
                  {t('orders.reorder.menuLabel')}
                  <Text size="xs" c="dimmed">
                    {t('orders.reorder.menuHint')}
                  </Text>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          )}
        </>
      }
    >
      {access.isLoading && (
        <Paper withBorder radius="lg" p="md" bg="white">
          <Stack gap="md">
            <Skeleton height={36} radius="md" />
            <Skeleton height={220} radius="md" />
          </Stack>
        </Paper>
      )}
      {!access.isLoading && allowed && config.list()}
      {!access.isLoading && !allowed && (
        <Paper withBorder radius="lg" p="md" bg="white">
          <EmptyState
            icon={<IconLock size={32} stroke={1.6} />}
            title={t('hub.noAccessTitle')}
            description={t('hub.noAccessDescription')}
          />
        </Paper>
      )}
      <BillPickerDialog
        opened={picking === 'billPicker'}
        onClose={() => setPicking(null)}
        onPick={(billId) => navigate(`${routes.purchases.returnAdd}?bill=${billId}`)}
      />
      <OrderPickerDialog
        opened={picking === 'orderPicker'}
        onClose={() => setPicking(null)}
        onPick={(orderId) => navigate(`${routes.purchases.receiptAdd}?order=${orderId}`)}
      />
      <ReorderDialog opened={reordering} onClose={() => setReordering(false)} />
    </PageFrame>
  );
}
