import { PURCHASE_MENU } from '@/module/purchases/domain/purchaseAccess';
import {
  resolveTab,
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

  it('falls back to a tab the user may open', () => {
    const can = only(`${PURCHASE_MENU.approvePayment}:read`);
    expect(resolveTab('orders', can)).toBe('payments');
    expect(resolveTab(null, only(`${PURCHASE_MENU.documents}:read`))).toBe('overview');
  });
});
