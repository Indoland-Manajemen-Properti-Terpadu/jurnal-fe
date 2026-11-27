import { useState } from 'react';
import { ActionIcon, Button, Menu, Skeleton, Stack, Tooltip } from '@mantine/core';
import {
  IconArrowBackUp,
  IconChevronDown,
  IconFileText,
  IconLock,
  IconPlus,
  IconReceipt2,
  IconRefresh,
  IconRepeat,
  IconTag,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  canReadTab,
  LIST_TABS,
  listPath,
  visibleTabs,
} from '@/module/purchases/presentation/components/hub/hubTabs';
import { OverviewMetrics } from '@/module/purchases/presentation/components/hub/OverviewMetrics';
import { OverviewTab } from '@/module/purchases/presentation/components/hub/OverviewTab';
import { BillPickerDialog } from '@/module/purchases/presentation/components/returns/BillPickerDialog';
import { ReorderDialog } from '@/module/purchases/presentation/components/orders/ReorderDialog';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import {
  useDashboardActions,
  useDashboardSummary,
} from '@/module/purchases/presentation/hooks/useDashboard';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

/** Landing page of the purchasing area: what needs attention, where documents stand, payables aging. */
export default function PurchasesPage() {
  const { t } = useTranslation('purchases');
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const access = usePurchaseAccess();
  const client = useQueryClient();
  const scope = usePurchaseScope();
  const fetching = useIsFetching({ queryKey: purchaseKeys.all(scope) }) > 0;

  const summary = useDashboardSummary(!access.isLoading);
  const actions = useDashboardActions(!access.isLoading);
  const canReport = access.can(PURCHASE_MENU.reports, 'read');
  const openReport = () => navigate(routes.purchases.payables);
  const visible = visibleTabs(access.can);
  const [picking, setPicking] = useState(false);
  const [reordering, setReordering] = useState(false);
  const createItems = [
    ...(access.can(PURCHASE_MENU.request, 'create')
      ? [
          {
            label: t('hub.createRequest'),
            icon: <IconFileText size={16} />,
            run: () => navigate(routes.purchases.requestAdd),
          },
        ]
      : []),
    ...(access.can(PURCHASE_MENU.documents, 'create')
      ? [
          {
            label: t('orders.reorder.menuLabel'),
            icon: <IconRepeat size={16} />,
            run: () => setReordering(true),
          },
          {
            label: t('hub.createBill'),
            icon: <IconReceipt2 size={16} />,
            run: () => navigate(routes.purchases.billAdd),
          },
        ]
      : []),
    ...(access.can(PURCHASE_MENU.paymentRequests, 'create')
      ? [
          {
            label: t('paymentRequests.list.create'),
            icon: <IconWallet size={16} />,
            run: () => navigate(routes.purchases.paymentRequestAdd),
          },
        ]
      : []),
    ...(access.can(PURCHASE_MENU.returns, 'create')
      ? [
          {
            label: t('hub.createReturn'),
            icon: <IconArrowBackUp size={16} />,
            run: () => setPicking(true),
          },
        ]
      : []),
  ];

  // Old links opened a tab of this page (`?tab=bills`); each tab is a page of its own now.
  const legacyTab = LIST_TABS.find((tab) => tab === params.get('tab'));
  if (legacyTab) return <Navigate to={listPath(legacyTab)} replace />;

  const body = () => {
    if (access.isLoading) {
      return (
        <Stack gap="md">
          <Skeleton height={104} radius="md" />
          <Skeleton height={220} radius="md" />
        </Stack>
      );
    }
    if (visible.length === 0) {
      return (
        <EmptyState
          icon={<IconLock size={32} stroke={1.6} />}
          title={t('hub.noAccessTitle')}
          description={t('hub.noAccessDescription')}
        />
      );
    }
    return (
      <>
        <OverviewMetrics
          summary={summary.data}
          actions={actions.data}
          isLoading={summary.isLoading || actions.isLoading}
          onOpenReport={canReport ? openReport : undefined}
          onOpenReady={
            access.can(PURCHASE_MENU.paymentRequests, 'read')
              ? () => navigate(routes.purchases.payments)
              : undefined
          }
          onOpenUnbilled={
            access.can(PURCHASE_MENU.receipts, 'read')
              ? () => navigate(routes.purchases.receipts)
              : undefined
          }
        />
        <OverviewTab
          summary={summary.data}
          actions={actions.data}
          isLoading={summary.isLoading || actions.isLoading}
          isError={summary.isError || actions.isError}
          refetch={() => {
            summary.refetch();
            actions.refetch();
          }}
          canOpen={(tab) => canReadTab(tab, access.can)}
          onOpen={(tab) => navigate(listPath(tab))}
          onOpenReport={canReport ? openReport : undefined}
          onOpenVendor={
            canReport
              ? (id) => navigate(`${routes.purchases.payables}?vendor=${encodeURIComponent(id)}`)
              : undefined
          }
        />
      </>
    );
  };

  return (
    <PageFrame
      icon={IconShoppingCart}
      title={t('hub.title')}
      description={t('hub.subtitle')}
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
          {(access.can(PURCHASE_MENU.documents, 'read') ||
            access.can(PURCHASE_MENU.approvePriceChange, 'read')) && (
            <Button
              variant="default"
              leftSection={<IconTag size={16} />}
              onClick={() => navigate(routes.purchases.priceChanges)}
            >
              {t('bills.priceChange.queueTitle')}
            </Button>
          )}
          {createItems.length > 0 && (
            <Menu position="bottom-end" withinPortal shadow="md" radius="md">
              <Menu.Target>
                <Button
                  radius="md"
                  leftSection={<IconPlus size={16} />}
                  rightSection={<IconChevronDown size={16} />}
                >
                  {t('hub.createNew')}
                </Button>
              </Menu.Target>
              <Menu.Dropdown>
                {createItems.map((item) => (
                  <Menu.Item key={item.label} leftSection={item.icon} onClick={item.run}>
                    {item.label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            </Menu>
          )}
        </>
      }
    >
      {body()}
      <BillPickerDialog
        opened={picking}
        onClose={() => setPicking(false)}
        onPick={(billId) => navigate(`${routes.purchases.returnAdd}?bill=${billId}`)}
      />
      <ReorderDialog opened={reordering} onClose={() => setReordering(false)} />
    </PageFrame>
  );
}
