import { describe, expect, it } from 'vitest';
import { routes } from '@/router/routes';
import { navigation as idNavigation } from '@/i18n/locales/id/navigation';
import { navigation as enNavigation } from '@/i18n/locales/en/navigation';
import { navigationSections, resolveSectionTitle, sidebarLinks } from './navigationRegistry';

const items = navigationSections.flatMap((section) => section.items);
const children = items.flatMap((item) => item.children ?? []);

const flatten = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : Object.values(value as Record<string, unknown>).flatMap(flatten);
const knownRoutes = new Set(flatten(routes));

describe('navigation registry', () => {
  it('has a label in Indonesian and English for every item and group', () => {
    const keys = [
      ...navigationSections.map((section) => section.groupKey),
      ...items.map((item) => item.labelKey),
      ...children.map((child) => child.labelKey),
    ];
    for (const key of keys) {
      expect(idNavigation, key).toHaveProperty(key);
      expect(enNavigation, key).toHaveProperty(key);
    }
  });

  it('points every entry at a real route', () => {
    for (const link of sidebarLinks()) {
      expect(knownRoutes.has(link), link).toBe(true);
    }
  });

  it('lists each page once in the sidebar', () => {
    const links = sidebarLinks();
    expect(new Set(links).size).toBe(links.length);
  });

  it('gives every purchasing list its own page instead of a tab', () => {
    const purchases = items.find((item) => item.id === 'purchases');
    const links = (purchases?.children ?? []).map((child) => child.link ?? '');

    expect(links.every((link) => !link.includes('?'))).toBe(true);
    expect(links).toEqual(
      expect.arrayContaining([
        routes.purchases.requests,
        routes.purchases.orders,
        routes.purchases.receipts,
        routes.purchases.bills,
        routes.purchases.payments,
        routes.purchases.returns,
        routes.purchases.payables,
      ])
    );
  });

  it('gives every sub-item an icon, never a dot', () => {
    for (const child of children) expect(child.icon, child.id).toBeDefined();
  });

  it('lists every module in the sidebar, finished or not, so each one starts from a real page', () => {
    const ids = new Set([...items, ...children].map((entry) => entry.id));

    for (const id of [
      'expenses',
      'budgetPlanning',
      'production',
      'fulfillment',
      'assets',
      'closingBooks',
      'journalEntries',
      'warehouses',
      'stockMovements',
      'stockTake',
      'salesQuotes',
      'salesOrders',
      'salesPayments',
      'salesReturns',
      'receivables',
    ]) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('shows no status badge: an entry is only a label, an icon and a page', () => {
    for (const entry of [...items, ...children]) {
      expect(Object.keys(entry), entry.id).not.toContain('status');
      expect(entry.link, entry.id).toBeTruthy();
    }
  });

  it('keeps the product catalog under inventory, with its categories and units', () => {
    const inventory = items.find((item) => item.id === 'inventory');

    expect(inventory?.children?.map((entry) => entry.id)).toEqual([
      'products',
      'productCategories',
      'productUnits',
      'warehouses',
      'stockMovements',
      'stockTake',
    ]);
    expect(items.some((item) => item.id === 'products')).toBe(false);
  });

  it('puts contacts at the top, next to the overview', () => {
    const main = navigationSections.find((section) => section.id === 'main');

    expect(main?.items.map((item) => item.id)).toContain('contacts');
    expect(navigationSections.some((section) => section.id === 'masterData')).toBe(false);
  });

  it('has one Settings entry that stays active on every settings page', () => {
    const settings = items.filter((item) => item.id === 'settings');

    expect(settings).toHaveLength(1);
    expect(settings[0].match).toBe(routes.settings.main);
  });
});

describe('resolveSectionTitle', () => {
  it('names the group and page of a sidebar item', () => {
    expect(resolveSectionTitle(routes.sales.orders)).toEqual({
      titleKey: 'salesOrders',
      groupKey: 'groupTransactions',
    });
  });

  it('titles each purchasing page by its own name', () => {
    expect(resolveSectionTitle(routes.purchases.bills)?.titleKey).toBe('purchasesBills');
    expect(resolveSectionTitle(routes.purchases.payables)?.titleKey).toBe('payables');
    expect(resolveSectionTitle(routes.purchases.main)?.titleKey).toBe('purchasesOverview');
  });

  it('lets a detail page win over the list it belongs to', () => {
    expect(resolveSectionTitle('/general-journal/add-account')?.titleKey).toBe('addAccount');
    expect(resolveSectionTitle(routes.chartOfAccounts.main)?.titleKey).toBe('chartOfAccounts');
  });

  it('puts petty cash under cash and bank without taking the parent title', () => {
    expect(resolveSectionTitle(routes.pettyCash.main)?.titleKey).toBe('pettyCash');
    expect(resolveSectionTitle(routes.bankCash.addReceive)?.titleKey).toBe('cashBankAccounts');
  });

  it('files each screen under the group the sidebar shows it in', () => {
    expect(resolveSectionTitle(routes.production.main)?.groupKey).toBe('groupOperations');
    expect(resolveSectionTitle(routes.products.main)?.groupKey).toBe('groupOperations');
    expect(resolveSectionTitle(routes.products.categories)?.titleKey).toBe('productCategories');
    expect(resolveSectionTitle('/products/abc123')?.titleKey).toBe('productsMenu');
    expect(resolveSectionTitle(routes.contacts.main)?.groupKey).toBe('groupMain');
    expect(resolveSectionTitle(routes.assets.main)?.groupKey).toBe('groupAccounting');
    expect(resolveSectionTitle(routes.beginningBalances.main)?.groupKey).toBe('groupAccounting');
    expect(resolveSectionTitle(routes.reports.balanceSheet)?.titleKey).toBe('financialReports');
  });

  it('no longer titles the budget settings page as sales', () => {
    expect(resolveSectionTitle(routes.budgeting.budgetManagement)?.titleKey).toBe('budgetPlanning');
  });

  it('titles every settings page, including user management', () => {
    expect(resolveSectionTitle(routes.settings.taxes)?.groupKey).toBe('groupSettings');
    expect(resolveSectionTitle(routes.userManagement.addRole)?.titleKey).toBe('userManagement');
    expect(resolveSectionTitle(routes.userManagement.history)?.titleKey).toBe('userManagement');
  });

  it('returns nothing for an unknown path', () => {
    expect(resolveSectionTitle('/nowhere')).toBeUndefined();
  });
});
