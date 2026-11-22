import { describe, expect, it } from 'vitest';
import {
  actionPath,
  actionPrefix,
  lateDays,
  type DashboardAction,
} from '@/module/purchases/domain/dashboard';

const action = (over: Partial<DashboardAction> = {}): DashboardAction => ({
  key: 'p-6b01',
  title: 'Lengkapi pengadaan',
  subtitle: '',
  cta: 'Buka',
  target: { type: 'purchaseRequest', id: 'abc' },
  waiting: 0,
  late: -14,
  due: null,
  ...over,
});

describe('dashboard actions', () => {
  it('opens the document the action is about, whatever its kind', () => {
    expect(actionPath(action().target)).toBe('/purchases/requests/abc');
    expect(actionPath({ type: 'paymentRequest', id: 'x' })).toBe('/purchases/payment-requests/x');
    expect(actionPath({ type: 'purchasePayment', id: 'x' })).toBe('/purchases/payments/x');
    expect(actionPath({ type: 'goodsReceipt', id: 'x' })).toBe('/purchases/receipts/x');
  });

  it('knows the prefixes it has an English line for and nothing else', () => {
    expect(actionPrefix('p-6b01')).toBe('p');
    expect(actionPrefix('fo-6b01')).toBe('fo');
    expect(actionPrefix('zz-6b01')).toBeNull();
  });

  it('is late only past the limit, never while the number is negative or missing', () => {
    expect(lateDays(action({ late: -14 }))).toBeNull();
    expect(lateDays(action({ late: 0 }))).toBeNull();
    expect(lateDays(action({ late: null }))).toBeNull();
    expect(lateDays(action({ late: 3 }))).toBe(3);
  });
});
