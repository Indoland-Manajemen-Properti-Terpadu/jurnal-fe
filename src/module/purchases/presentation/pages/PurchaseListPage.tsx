import type { ReactNode } from 'react';
import { ActionIcon, Button, Paper, Skeleton, Stack, Tooltip } from '@mantine/core';
import {
  IconArrowBackUp,
  IconFileText,
  IconLock,
  IconPackage,
  IconPlus,
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
import { PaymentList } from '@/module/purchases/presentation/components/lists/PaymentList';
import { ReceiptList } from '@/module/purchases/presentation/components/lists/ReceiptList';
import { RequestList } from '@/module/purchases/presentation/components/lists/RequestList';
import { ReturnList } from '@/module/purchases/presentation/components/lists/ReturnList';
import { PageFrame } from '@/module/purchases/presentation/components/shared/PageFrame';
import { purchaseKeys } from '@/module/purchases/presentation/hooks/purchaseKeys';
import { usePurchaseAccess } from '@/module/purchases/presentation/hooks/usePurchaseAccess';
import { usePurchaseScope } from '@/module/purchases/presentation/hooks/usePurchaseScope';
import { routes } from '@/router/routes';

interface ListPageConfig {
  icon: Icon;
  list: () => ReactNode;
  /** Only the first and last steps of the chain start from scratch; the others follow a document. */
  create?: { labelKey: string; path: string; menu: 'documents' | 'payments' };
}

const PAGES: Record<ListTab, ListPageConfig> = {
  requests: {
    icon: IconFileText,
    list: () => <RequestList />,
    create: { labelKey: 'hub.createRequest', path: routes.purchases.requestAdd, menu: 'documents' },
  },
  orders: { icon: IconPackage, list: () => <OrderList /> },
  receipts: { icon: IconTruckDelivery, list: () => <ReceiptList /> },
  bills: { icon: IconReceipt2, list: () => <BillList /> },
  payments: {
    icon: IconWallet,
    list: () => <PaymentList />,
    create: {
      labelKey: 'hub.createAdvance',
      path: `${routes.purchases.paymentAdd}?type=advance`,
      menu: 'payments',
    },
  },
  returns: { icon: IconArrowBackUp, list: () => <ReturnList /> },
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
  const config = PAGES[tab];
  const { create } = config;
  const canCreate = create ? access.can(PURCHASE_MENU[create.menu], 'create') : false;
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
              onClick={() => navigate(create.path)}
            >
              {t(create.labelKey)}
            </Button>
          )}
        </>
      }
    >
      <Paper withBorder radius="lg" p="md" bg="white">
        {access.isLoading && (
          <Stack gap="md">
            <Skeleton height={36} radius="md" />
            <Skeleton height={220} radius="md" />
          </Stack>
        )}
        {!access.isLoading && allowed && config.list()}
        {!access.isLoading && !allowed && (
          <EmptyState
            icon={<IconLock size={32} stroke={1.6} />}
            title={t('hub.noAccessTitle')}
            description={t('hub.noAccessDescription')}
          />
        )}
      </Paper>
    </PageFrame>
  );
}
