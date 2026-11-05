import {
  PURCHASE_MENU,
  type MenuAction,
  type PurchaseMenu,
} from '@/module/purchases/domain/purchaseAccess';

export type HubTab =
  | 'overview'
  | 'requests'
  | 'orders'
  | 'receipts'
  | 'bills'
  | 'payments'
  | 'returns';

export const HUB_TABS: HubTab[] = [
  'overview',
  'requests',
  'orders',
  'receipts',
  'bills',
  'payments',
  'returns',
];

export const DEFAULT_TAB: HubTab = 'overview';

export type CanFn = (menu: PurchaseMenu, action: MenuAction) => boolean;

const M = PURCHASE_MENU;

/** The approval menus also open the matching list, so an approver can find the document. */
export const canReadTab = (tab: HubTab, can: CanFn): boolean => {
  const documents = can(M.documents, 'read');
  switch (tab) {
    case 'overview':
      return documents || can(M.payments, 'read') || can(M.reports, 'read');
    case 'requests':
      return documents || can(M.approvePurchaseRequest, 'read');
    case 'orders':
      return documents || can(M.approvePurchaseOrder, 'read');
    case 'payments':
      return can(M.payments, 'read') || can(M.approvePayment, 'read');
    default:
      return documents;
  }
};

export const visibleTabs = (can: CanFn): HubTab[] => HUB_TABS.filter((tab) => canReadTab(tab, can));

/** The tab named in the address, or the first one the user may open. */
export const resolveTab = (value: string | null, can: CanFn): HubTab => {
  const visible = visibleTabs(can);
  const requested = HUB_TABS.find((tab) => tab === value);
  if (requested && visible.includes(requested)) return requested;
  return visible[0] ?? DEFAULT_TAB;
};
