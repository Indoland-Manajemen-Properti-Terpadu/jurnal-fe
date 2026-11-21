import { routes } from '@/router/routes';
import {
  PURCHASE_MENU,
  type MenuAction,
  type PurchaseMenu,
} from '@/module/purchases/domain/purchaseAccess';

/** The pages of the purchasing area. `overview` is the landing page; the rest are document lists. */
export type HubTab =
  | 'overview'
  | 'requests'
  | 'orders'
  | 'receipts'
  | 'bills'
  | 'payments'
  | 'returns';

export type ListTab = Exclude<HubTab, 'overview'>;

export const LIST_TABS: ListTab[] = [
  'requests',
  'orders',
  'receipts',
  'bills',
  'payments',
  'returns',
];

export const HUB_TABS: HubTab[] = ['overview', ...LIST_TABS];

/** Address of a list page. */
export const listPath = (tab: ListTab): string => routes.purchases[tab];

export type CanFn = (menu: PurchaseMenu, action: MenuAction) => boolean;

const M = PURCHASE_MENU;

/** Menus that open each page. An approval menu also opens the list its document lives in. */
const TAB_MENUS: Record<ListTab, PurchaseMenu[]> = {
  requests: [M.request, M.requestVerify, M.approveProcurement],
  orders: [M.documents, M.approveProcurement],
  receipts: [M.receipts, M.approveReceipt],
  bills: [M.documents],
  payments: [M.payments, M.paymentRequests, M.approvePayment],
  returns: [M.returns],
};

export const canReadTab = (tab: HubTab, can: CanFn): boolean => {
  const menus = tab === 'overview' ? Object.values(M) : TAB_MENUS[tab];
  return menus.some((menu) => can(menu, 'read'));
};

export const visibleTabs = (can: CanFn): HubTab[] => HUB_TABS.filter((tab) => canReadTab(tab, can));
