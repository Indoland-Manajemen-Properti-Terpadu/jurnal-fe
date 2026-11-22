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
  it('shows every page to someone who holds every purchasing menu', () => {
    const can = only(...Object.values(PURCHASE_MENU).map((menu) => `${menu}:read`));
    expect(visibleTabs(can)).toHaveLength(7);
  });

  it('gives a requester the overview and their requests only', () => {
    const can = only(`${PURCHASE_MENU.request}:read`);
    expect(visibleTabs(can)).toEqual(['overview', 'requests']);
  });

  it('gives a payment approver the overview and the payments list but no document lists', () => {
    const can = only(`${PURCHASE_MENU.approvePayment}:read`);
    expect(visibleTabs(can)).toEqual(['overview', 'payments']);
  });

  it('opens the receipts list to a BAPP approver and the orders list to a procurement approver', () => {
    expect(canReadTab('receipts', only(`${PURCHASE_MENU.approveReceipt}:read`))).toBe(true);
    expect(canReadTab('orders', only(`${PURCHASE_MENU.approveProcurement}:read`))).toBe(true);
    expect(canReadTab('bills', only(`${PURCHASE_MENU.approveProcurement}:read`))).toBe(false);
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
