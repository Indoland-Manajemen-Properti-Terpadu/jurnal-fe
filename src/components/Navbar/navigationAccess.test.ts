import { describe, expect, it } from 'vitest';
import { filterNavigation } from './navigationAccess';
import { navigationSections } from './navigationRegistry';

const itemsOf = (sections: ReturnType<typeof filterNavigation>) =>
  sections.flatMap((section) => section.items);
const idsOf = (sections: ReturnType<typeof filterNavigation>) =>
  itemsOf(sections).map((item) => item.id);

const reads =
  (...menuIds: string[]) =>
  (menuId: string) =>
    menuIds.includes(menuId);

describe('filterNavigation', () => {
  it('shows everything while the rights are unknown', () => {
    expect(filterNavigation(navigationSections, null)).toEqual(navigationSections);
  });

  it('keeps the entries that need no menu, so unfinished work stays visible to everyone', () => {
    const ids = idsOf(filterNavigation(navigationSections, reads()));

    expect(ids).toEqual(
      expect.arrayContaining([
        'dashboard',
        'expenses',
        'production',
        'fulfillment',
        'assets',
        'inventory',
      ])
    );
    expect(ids).not.toEqual(expect.arrayContaining(['sales', 'purchases', 'contacts', 'settings']));
    expect(ids).not.toContain('contacts');
  });

  it('shows only the purchasing and contact menus a payable clerk holds', () => {
    const ids = idsOf(
      filterNavigation(navigationSections, reads('JP-PURCH', 'JP-PURCH-PAY', 'JP-CNTCT'))
    );

    expect(ids).toEqual(expect.arrayContaining(['purchases', 'contacts']));
    expect(ids).not.toEqual(expect.arrayContaining(['sales', 'products', 'chartOfAccounts']));
  });

  it('opens only the matching pages for a procurement approver', () => {
    const result = filterNavigation(navigationSections, reads('JP-PURCH-APR-PROC'));
    const purchases = itemsOf(result).find((item) => item.id === 'purchases');
    const childIds = purchases?.children?.map((child) => child.id) ?? [];

    expect(childIds).toEqual(['purchasesOverview', 'purchasesRequests', 'purchasesOrders']);
  });

  it('gives a requester only their requests and the overview', () => {
    const result = filterNavigation(navigationSections, reads('JP-PURCH-FPPBJ'));
    const purchases = itemsOf(result).find((item) => item.id === 'purchases');

    expect(purchases?.children?.map((child) => child.id)).toEqual([
      'purchasesOverview',
      'purchasesRequests',
    ]);
  });

  it('gives Accounting verification the requests list without orders or bills', () => {
    const result = filterNavigation(navigationSections, reads('JP-PURCH-FPPBJ-VER'));
    const purchases = itemsOf(result).find((item) => item.id === 'purchases');
    const childIds = purchases?.children?.map((child) => child.id) ?? [];

    expect(childIds).toContain('purchasesRequests');
    expect(childIds).not.toEqual(expect.arrayContaining(['purchasesOrders', 'purchasesBills']));
  });

  it('keeps the payables report closed to a BAPP approver and the cashier', () => {
    const bapp = itemsOf(filterNavigation(navigationSections, reads('JP-PURCH-APR-BAPP'))).find(
      (item) => item.id === 'purchases'
    );
    const cashier = itemsOf(filterNavigation(navigationSections, reads('JP-PURCH-PAY'))).find(
      (item) => item.id === 'purchases'
    );

    expect(bapp?.children?.map((child) => child.id)).toEqual([
      'purchasesOverview',
      'purchasesReceipts',
    ]);
    expect(cashier?.children?.map((child) => child.id)).not.toContain('payables');
  });

  it('drops an entry with sub-items when none of them is allowed', () => {
    const ids = idsOf(filterNavigation(navigationSections, reads('JP-CNTCT')));

    expect(ids).not.toContain('cashBank');
  });

  it('shows cash and bank to a petty cash custodian but not the bank accounts', () => {
    const result = filterNavigation(navigationSections, reads('JP-PC-VCH'));
    const cashBank = itemsOf(result).find((item) => item.id === 'cashBank');

    expect(cashBank?.children?.map((child) => child.id)).toEqual(['pettyCash']);
  });

  it('opens Settings for someone who holds only user management', () => {
    const ids = idsOf(filterNavigation(navigationSections, reads('JP-SETT-UM')));

    expect(ids).toContain('settings');
  });
});
