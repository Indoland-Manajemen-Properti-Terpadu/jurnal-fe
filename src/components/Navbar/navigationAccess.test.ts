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

  it('opens purchasing for an approver but keeps the payables report closed', () => {
    const result = filterNavigation(navigationSections, reads('JP-PURCH-APR-PO'));
    const purchases = itemsOf(result).find((item) => item.id === 'purchases');
    const childIds = purchases?.children?.map((child) => child.id) ?? [];

    expect(childIds).toContain('purchasesOrders');
    expect(childIds).not.toContain('payables');
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
