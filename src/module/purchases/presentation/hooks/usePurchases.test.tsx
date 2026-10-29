import { act, renderHook } from '@testing-library/react';
import { vi } from 'vitest';
import { usePurchases } from './usePurchases';

vi.mock('@mantine/notifications', () => ({ notifications: { show: vi.fn() } }));

const STORAGE_KEY = 'jurnal_purchase_bills_data';

const storedBills = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');

const baseValues = {
  vendorName: 'Vendor Uji',
  billNumber: 'BILL/TEST/1',
  transactionDate: '2026-04-01',
  dueDate: '2099-01-01',
  paymentTerm: 'Net 30',
};

describe('usePurchases characterization', () => {
  beforeEach(() => localStorage.clear());

  it('seeds the stored bills on first load under the legacy key', () => {
    const { result } = renderHook(() => usePurchases());

    expect(result.current.purchases).toHaveLength(4);
    expect(storedBills()).toHaveLength(4);
  });

  it('marks an unpaid bill with a past due date as OVERDUE', () => {
    const { result } = renderHook(() => usePurchases());

    const bill = result.current.purchases.find((b) => b.id === 'bill-001');
    expect(bill?.status).toBe('OVERDUE');
    expect(result.current.purchases.find((b) => b.id === 'bill-003')?.status).toBe('PAID');
  });

  const createWith = (items: { quantity: number; unitPrice: number; taxRate: number }[]) => {
    const { result } = renderHook(() => usePurchases());
    let ok = false;
    act(() => {
      ok = result.current.createPurchase({
        ...baseValues,
        items: items.map((item) => ({ itemName: 'Item', ...item })),
      });
    });
    expect(ok).toBe(true);
    return { result, bill: storedBills()[0] };
  };

  it('computes quantity 2.5 x 150000 with 11 percent tax', () => {
    const { bill } = createWith([{ quantity: 2.5, unitPrice: 150000, taxRate: 11 }]);

    expect(bill.subtotal).toBe(375000);
    expect(bill.taxAmount).toBe(41250);
    expect(bill.totalAmount).toBe(416250);
    expect(bill.remainingAmount).toBe(416250);
    expect(bill.items[0].total).toBe(416250);
  });

  it('computes 11 percent of 18500000 as 2035000 across two lines (matches the seed)', () => {
    const { bill } = createWith([
      { quantity: 100, unitPrice: 150000, taxRate: 11 },
      { quantity: 500, unitPrice: 7000, taxRate: 11 },
    ]);

    expect(bill.subtotal).toBe(18500000);
    expect(bill.taxAmount).toBe(2035000);
    expect(bill.totalAmount).toBe(20535000);
    expect(bill.items.map((i: { total: number }) => i.total)).toEqual([16650000, 3885000]);
  });

  it('computes a decimal unit price', () => {
    const { bill } = createWith([{ quantity: 3, unitPrice: 1500.5, taxRate: 0 }]);

    expect(bill.subtotal).toBe(4501.5);
    expect(bill.taxAmount).toBe(0);
    expect(bill.totalAmount).toBe(4501.5);
  });

  it('computes tax on a decimal price that divides to two decimals', () => {
    const { bill } = createWith([{ quantity: 2, unitPrice: 1500.5, taxRate: 11 }]);

    expect(bill.subtotal).toBe(3001);
    expect(bill.taxAmount).toBe(330.11);
    expect(bill.totalAmount).toBe(3331.11);
  });

  it('falls back to quantity 1 and price 0 for empty values', () => {
    const { bill } = createWith([
      { quantity: 0, unitPrice: 0, taxRate: 0 },
      { quantity: 4, unitPrice: 100, taxRate: 0 },
    ]);

    expect(bill.items[0].quantity).toBe(1);
    expect(bill.subtotal).toBe(400);
  });

  it('pays part of a bill, then settles it, never going below zero remaining', () => {
    const { result } = renderHook(() => usePurchases());
    const pay = (amount: number) =>
      act(() => {
        result.current.payPurchase({
          purchaseId: 'bill-004',
          paymentDate: '2026-04-20',
          amount,
          paymentMethod: 'Transfer Bank',
          paymentAccountId: '1-10001',
        });
      });

    pay(1000000);
    let bill = storedBills().find((b: { id: string }) => b.id === 'bill-004');
    expect(bill).toMatchObject({
      paidAmount: 3500000,
      remainingAmount: 1495000,
      status: 'PARTIAL',
    });

    pay(5000000);
    bill = storedBills().find((b: { id: string }) => b.id === 'bill-004');
    expect(bill).toMatchObject({ paidAmount: 8500000, remainingAmount: 0, status: 'PAID' });
  });

  it('deletes a bill and persists the list', () => {
    const { result } = renderHook(() => usePurchases());

    act(() => result.current.deletePurchase('bill-001', 'BILL/2026/04/001'));

    expect(storedBills().map((b: { id: string }) => b.id)).toEqual([
      'bill-002',
      'bill-003',
      'bill-004',
    ]);
  });
});
