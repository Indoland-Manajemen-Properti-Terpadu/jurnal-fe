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
