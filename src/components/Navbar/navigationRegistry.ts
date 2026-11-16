import {
  AddressBook,
  ArrowsLeftRight,
  ArrowUUpLeft,
  Bank,
  BoundingBox,
  Buildings,
  ChartBar,
  ChartPieSlice,
  ClipboardText,
  Coins,
  Factory,
  FileText,
  GearSix,
  Handshake,
  HouseLine,
  ListBullets,
  Lock,
  Money,
  Package,
  Receipt,
  ReceiptX,
  Ruler,
  Scales,
  ShieldCheck,
  ShoppingCart,
  SquaresFour,
  Storefront,
  Tag,
  Toolbox,
  Truck,
  Wallet,
  Warehouse,
} from '@phosphor-icons/react';
import type { ElementType } from 'react';
import { NAV_MENU } from '@/components/Navbar/navigationMenus';
import { routes } from '@/router/routes';

/**
 * Single source of truth for the app sidebar and the header breadcrumb.
 * Add a screen here once; the sidebar, the active state, the breadcrumb and the access filter follow.
 *
 * `menus` are server menu ids (`GET /v1/menus`). An item is shown when the signed-in person can read
 * at least one of them; an item without `menus` is always shown. The server stays the judge, this
 * only keeps people from seeing menus they cannot use.
 *
 * Every entry opens a page. A module that is not built yet still has its page (the shared
 * `PlannedModulePage`), so the whole menu can be seen and each module starts from a real route.
 */
export type NavChild = {
  id: string;
  /** Key in the `navigation` namespace. */
  labelKey: string;
  icon: ElementType;
  link: string;
  menus?: string[];
};

export type NavItem = {
  id: string;
  labelKey: string;
  icon: ElementType;
  /** Page of the entry; for an entry with children, the page the collapsed rail opens. */
  link: string;
  /** Address prefix that keeps the entry active when its pages are deeper than `link`. */
  match?: string;
  menus?: string[];
  children?: NavChild[];
  /** Shows the pending-approval count. */
  badge?: 'pendingChanges';
};

export type NavSection = {
  id: string;
  /** Key in the `navigation` namespace. */
  groupKey: string;
  items: NavItem[];
};

const child = (
  id: string,
  icon: ElementType,
  link: string,
  menus?: string[],
  labelKey = id
): NavChild => ({ id, labelKey, icon, link, menus });

export const navigationSections: NavSection[] = [
  {
    id: 'main',
    groupKey: 'groupMain',
    items: [
      { id: 'dashboard', labelKey: 'dashboard', icon: HouseLine, link: routes.dashboard },
      {
        id: 'pendingChanges',
        labelKey: 'pendingChanges',
        icon: ShieldCheck,
        link: routes.pendingChanges.main,
        menus: [...NAV_MENU.approvals],
        badge: 'pendingChanges',
      },
      {
        id: 'contacts',
        labelKey: 'contacts',
        icon: AddressBook,
        link: routes.contacts.main,
        menus: [...NAV_MENU.contacts],
      },
    ],
  },
  {
    id: 'transactions',
    groupKey: 'groupTransactions',
    items: [
      {
        id: 'sales',
        labelKey: 'sales',
        icon: Storefront,
        link: routes.sales.main,
        menus: [...NAV_MENU.sales],
        children: [
          child('salesInvoices', Receipt, routes.sales.main),
          child('salesQuotes', FileText, routes.sales.quotations),
          child('salesOrders', ClipboardText, routes.sales.orders),
          child('salesPayments', Wallet, routes.sales.payments),
          child('salesReturns', ArrowUUpLeft, routes.sales.returns),
          child('receivables', ChartBar, routes.sales.receivables),
        ],
      },
      {
        id: 'purchases',
        labelKey: 'purchases',
        icon: ShoppingCart,
        link: routes.purchases.main,
        menus: [...NAV_MENU.purchases],
        children: [
          child('purchasesOverview', SquaresFour, routes.purchases.main),
          child('purchasesRequests', FileText, routes.purchases.requests),
          child('purchasesOrders', Package, routes.purchases.orders),
          child('purchasesReceipts', Truck, routes.purchases.receipts),
          child('purchasesBills', Receipt, routes.purchases.bills),
          child('purchasesPayments', Wallet, routes.purchases.payments),
          child('purchasesReturns', ArrowUUpLeft, routes.purchases.returns),
          child('payables', ChartBar, routes.purchases.payables, [...NAV_MENU.payables]),
        ],
      },
      { id: 'expenses', labelKey: 'expenses', icon: ReceiptX, link: routes.costs.main },
      {
        id: 'cashBank',
        labelKey: 'cashBank',
        icon: Bank,
        link: routes.bankCash.main,
        menus: [...NAV_MENU.ledger, ...NAV_MENU.pettyCash],
        children: [
          child('cashBankAccounts', Buildings, routes.bankCash.main, [...NAV_MENU.ledger]),
          child('pettyCash', Coins, routes.pettyCash.main, [...NAV_MENU.pettyCash]),
        ],
      },
    ],
  },
  {
    id: 'operations',
    groupKey: 'groupOperations',
    items: [
      {
        id: 'inventory',
        labelKey: 'inventory',
        icon: Warehouse,
        link: routes.products.main,
        children: [
          child(
            'products',
            BoundingBox,
            routes.products.main,
            [...NAV_MENU.products],
            'productsMenu'
          ),
          child('productCategories', Tag, routes.products.categories, [...NAV_MENU.products]),
          child('productUnits', Ruler, routes.products.units, [...NAV_MENU.products]),
          child('warehouses', Warehouse, routes.inventory.warehouses),
          child('stockMovements', ArrowsLeftRight, routes.inventory.stockMovements),
          child('stockTake', ClipboardText, routes.inventory.stockTake),
        ],
      },
      { id: 'production', labelKey: 'production', icon: Factory, link: routes.production.main },
      {
        id: 'fulfillment',
        labelKey: 'fulfillment',
        icon: Handshake,
        link: routes.fulfillment.main,
      },
    ],
  },
  {
    id: 'accounting',
    groupKey: 'groupAccounting',
    items: [
      {
        id: 'chartOfAccounts',
        labelKey: 'chartOfAccounts',
        icon: ListBullets,
        link: routes.chartOfAccounts.main,
        menus: [...NAV_MENU.ledger],
      },
      {
        id: 'beginningBalances',
        labelKey: 'beginningBalance',
        icon: Scales,
        link: routes.beginningBalances.main,
        menus: [...NAV_MENU.ledger],
      },
      { id: 'assets', labelKey: 'assets', icon: Toolbox, link: routes.assets.main },
      {
        id: 'budgetPlanning',
        labelKey: 'budgetMenu',
        icon: Money,
        link: routes.budgeting.planning,
      },
      {
        id: 'closingBooks',
        labelKey: 'closingBooksMenu',
        icon: Lock,
        link: routes.periodClosing.main,
        menus: [...NAV_MENU.periodClosing],
      },
      {
        id: 'reports',
        labelKey: 'financialReports',
        icon: ChartPieSlice,
        link: routes.reports.main,
        menus: [...NAV_MENU.ledger],
      },
    ],
  },
  {
    id: 'settings',
    groupKey: 'groupSettings',
    items: [
      {
        id: 'settings',
        labelKey: 'settings',
        icon: GearSix,
        link: routes.settings.main,
        match: routes.settings.main,
        menus: [...NAV_MENU.settings, ...NAV_MENU.users, ...NAV_MENU.approvalFlow],
      },
    ],
  },
];

export type SectionTitle = { titleKey: string; groupKey: string };

type TitleEntry = SectionTitle & { prefix: string };

/**
 * Pages that are not a sidebar item but belong to a section (forms, details, old addresses).
 * Matching is by longest prefix, so a detail page wins over the list it belongs to.
 */
const extraTitles: TitleEntry[] = [
  { prefix: routes.bankConnection.main, titleKey: 'bankConnection', groupKey: 'groupTransactions' },
  // The general journal opens from the report center, so it keeps its own title there.
  { prefix: routes.journalEntries.main, titleKey: 'journalEntries', groupKey: 'groupAccounting' },
  {
    prefix: '/general-journal/detail-transaction-journal',
    titleKey: 'detailJournalTransaction',
    groupKey: 'groupAccounting',
  },
  {
    prefix: '/general-journal/add-transaction-journal',
    titleKey: 'addJournalTransaction',
    groupKey: 'groupAccounting',
  },
  {
    prefix: '/general-journal/detail-account-cb',
    titleKey: 'accountDetailCB',
    groupKey: 'groupAccounting',
  },
  {
    prefix: '/general-journal/bank-statement',
    titleKey: 'importBankStatement',
    groupKey: 'groupAccounting',
  },
  {
    prefix: '/general-journal/detail-account',
    titleKey: 'accountDetailNonCB',
    groupKey: 'groupAccounting',
  },
  { prefix: '/general-journal/add-account', titleKey: 'addAccount', groupKey: 'groupAccounting' },
  { prefix: '/general-journal/edit-account', titleKey: 'editAccount', groupKey: 'groupAccounting' },
  { prefix: '/setting-budget', titleKey: 'budgetPlanning', groupKey: 'groupAccounting' },
  { prefix: '/settings/company-setting', titleKey: 'companySettings', groupKey: 'groupSettings' },
  { prefix: '/settings/user-management', titleKey: 'userManagement', groupKey: 'groupSettings' },
  { prefix: '/profile', titleKey: 'profile', groupKey: 'groupAccount' },
  // Old spelling kept so a bookmarked address still shows a title.
  { prefix: '/asset', titleKey: 'assets', groupKey: 'groupAccounting' },
];

const sidebarTitles = (): TitleEntry[] =>
  navigationSections.flatMap((section) =>
    section.items.flatMap((item): TitleEntry[] => [
      { prefix: item.match ?? item.link, titleKey: item.labelKey, groupKey: section.groupKey },
      ...(item.children ?? []).map((entry) => ({
        prefix: entry.link,
        titleKey: entry.labelKey,
        groupKey: section.groupKey,
      })),
    ])
  );

const matchesPrefix = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Title and group of the page for the header breadcrumb; the longest matching prefix wins. */
export function resolveSectionTitle(pathname: string): SectionTitle | undefined {
  const candidates = [...extraTitles, ...sidebarTitles()].filter((entry) =>
    matchesPrefix(pathname, entry.prefix)
  );
  if (candidates.length === 0) return undefined;
  // On a tie the later entry wins, and children are listed after their parent: the page is named by
  // the most specific entry.
  const best = candidates.reduce((a, b) => (b.prefix.length >= a.prefix.length ? b : a));
  return { titleKey: best.titleKey, groupKey: best.groupKey };
}

/** Every address that opens a page from the sidebar; each must have one owner. */
export const sidebarLinks = (): string[] =>
  navigationSections.flatMap((section) =>
    section.items.flatMap((item) =>
      item.children ? item.children.map((entry) => entry.link) : [item.link]
    )
  );
