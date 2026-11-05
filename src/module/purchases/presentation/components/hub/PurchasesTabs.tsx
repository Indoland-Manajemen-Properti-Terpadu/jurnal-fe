import type { ReactNode } from 'react';
import { Tabs } from '@mantine/core';
import {
  IconArrowBackUp,
  IconFileText,
  IconLayoutDashboard,
  IconPackage,
  IconReceipt2,
  IconTruckDelivery,
  IconWallet,
  type Icon,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CanFn, HubTab } from '@/module/purchases/presentation/components/hub/hubTabs';
import { BillList } from '@/module/purchases/presentation/components/lists/BillList';
import { OrderList } from '@/module/purchases/presentation/components/lists/OrderList';
import { PaymentList } from '@/module/purchases/presentation/components/lists/PaymentList';
import { ReceiptList } from '@/module/purchases/presentation/components/lists/ReceiptList';
import { RequestList } from '@/module/purchases/presentation/components/lists/RequestList';
import { ReturnList } from '@/module/purchases/presentation/components/lists/ReturnList';
import type { OverviewData } from '@/module/purchases/presentation/components/hub/useOverviewData';
import { OverviewTab } from '@/module/purchases/presentation/components/hub/OverviewTab';

const TAB_ICON: Record<HubTab, Icon> = {
  overview: IconLayoutDashboard,
  requests: IconFileText,
  orders: IconPackage,
  receipts: IconTruckDelivery,
  bills: IconReceipt2,
  payments: IconWallet,
  returns: IconArrowBackUp,
};

interface PurchasesTabsProps {
  active: HubTab;
  visible: HubTab[];
  can: CanFn;
  overview: OverviewData;
  onChange: (tab: HubTab) => void;
  onOpenReport?: () => void;
}

const content = (
  tab: HubTab,
  can: CanFn,
  overview: OverviewData,
  onOpen: (tab: HubTab) => void,
  onOpenReport?: () => void
): ReactNode => {
  switch (tab) {
    case 'requests':
      return <RequestList />;
    case 'orders':
      return <OrderList />;
    case 'receipts':
      return <ReceiptList />;
    case 'bills':
      return <BillList />;
    case 'payments':
      return <PaymentList />;
    case 'returns':
      return <ReturnList />;
    default:
      return <OverviewTab can={can} data={overview} onOpen={onOpen} onOpenReport={onOpenReport} />;
  }
};

/** Pills navigation of the hub. Only the active tab is mounted, so hidden tabs fetch nothing. */
export const PurchasesTabs = ({
  active,
  visible,
  can,
  overview,
  onChange,
  onOpenReport,
}: Readonly<PurchasesTabsProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <>
      <Tabs
        value={active}
        onChange={(value) => value && onChange(value as HubTab)}
        color="primary"
        variant="pills"
        radius="md"
      >
        <Tabs.List mb="md">
          {visible.map((tab) => {
            const TabIcon = TAB_ICON[tab];
            return (
              <Tabs.Tab key={tab} value={tab} leftSection={<TabIcon size={16} />}>
                {t(`hub.tabs.${tab}`)}
              </Tabs.Tab>
            );
          })}
        </Tabs.List>
      </Tabs>
      {content(active, can, overview, onChange, onOpenReport)}
    </>
  );
};
