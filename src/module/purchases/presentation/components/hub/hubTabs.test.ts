import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import { routes } from '@/router/routes';
import {
  LIST_TABS,
  canReadTab,
  listPath,
  visibleTabs,
  type CanFn,
} from '@/module/purchases/presentation/components/hub/hubTabs';

const only =
  (...allowed: string[]): CanFn =>
  (menu, action) =>
    allowed.includes(`${menu}:${action}`);

describe('hubTabs', () => {
  it('shows everything to someone who can read documents and payments', () => {
    const can = only(`${PURCHASE_MENU.documents}:read`, `${PURCHASE_MENU.payments}:read`);
    expect(visibleTabs(can)).toHaveLength(7);
  });

  it('gives a payment approver the payments list but no document lists', () => {
    const can = only(`${PURCHASE_MENU.approvePayment}:read`);
    expect(visibleTabs(can)).toEqual(['payments']);
  });

  it('keeps a page closed to someone who cannot read it', () => {
    const can = only(`${PURCHASE_MENU.approvePayment}:read`);
    expect(canReadTab('orders', can)).toBe(false);
    expect(canReadTab('payments', can)).toBe(true);
  });

  it('gives every list its own address under the purchasing area', () => {
    const paths = LIST_TABS.map(listPath);
    expect(new Set(paths).size).toBe(LIST_TABS.length);
    for (const path of paths) expect(path.startsWith(`${routes.purchases.main}/`)).toBe(true);
  });
});
