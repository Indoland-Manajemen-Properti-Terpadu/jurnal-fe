import { PurchaseBill } from './purchase';
import {
  applyPayment,
  calculateLine,
  calculateTotals,
  paidPercent,
  summarizePurchases,
  withDerivedStatus,
} from './purchaseTotals';

const bill = (overrides: Partial<PurchaseBill>): PurchaseBill => ({
  id: 'b',
  billNumber: 'B-1',
  vendorName: 'V',
  transactionDate: '2026-01-01',
  dueDate: '2026-02-01',
  status: 'UNPAID',
  subtotal: 0,
  taxAmount: 0,
  totalAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  paymentTerm: 'Net 30',
  items: [],
  ...overrides,
});

describe('calculateLine', () => {
  it('multiplies a decimal quantity by the price', () => {
    expect(calculateLine({ quantity: 2.5, unitPrice: 150000, taxRate: 11 })).toEqual({
      subtotal: 375000,
      tax: 41250,
      total: 416250,
    });
  });

  it('handles a decimal price', () => {
    expect(calculateLine({ quantity: 3, unitPrice: 1500.5, taxRate: 0 })).toEqual({
      subtotal: 4501.5,
      tax: 0,
      total: 4501.5,
    });
  });

  it('does not leak float artefacts', () => {
    expect(calculateLine({ quantity: 3, unitPrice: 0.1, taxRate: 0 }).subtotal).toBe(0.3);
  });

  it('rounds tax to the cent when the rate does not divide evenly', () => {
    expect(calculateLine({ quantity: 3, unitPrice: 1500.5, taxRate: 11 }).tax).toBe(495.17);
  });
});

describe('calculateTotals', () => {
  it('computes 11 percent of 18500000 as 2035000 (seed bill-001)', () => {
    expect(
      calculateTotals([
        { quantity: 100, unitPrice: 150000, taxRate: 11 },
        { quantity: 500, unitPrice: 7000, taxRate: 11 },
      ])
    ).toEqual({ subtotal: 18500000, taxAmount: 2035000, totalAmount: 20535000 });
  });

  it('is zero for no lines', () => {
    expect(calculateTotals([])).toEqual({ subtotal: 0, taxAmount: 0, totalAmount: 0 });
  });

  it('sums many decimal lines exactly', () => {
    const lines = Array.from({ length: 3 }, () => ({ quantity: 1, unitPrice: 0.1, taxRate: 0 }));

    expect(calculateTotals(lines).totalAmount).toBe(0.3);
  });
});

describe('applyPayment', () => {
  it('keeps a partial payment as PARTIAL', () => {
    expect(applyPayment({ totalAmount: 4995000, paidAmount: 2500000 }, 1000000)).toEqual({
      paidAmount: 3500000,
      remainingAmount: 1495000,
      status: 'PARTIAL',
    });
  });

  it('settles a bill with the exact remaining amount', () => {
    expect(applyPayment({ totalAmount: 4995000, paidAmount: 2500000 }, 2495000)).toEqual({
      paidAmount: 4995000,
      remainingAmount: 0,
      status: 'PAID',
    });
  });

  it('handles decimal payments exactly', () => {
    expect(applyPayment({ totalAmount: 0.3, paidAmount: 0.1 }, 0.2)).toEqual({
      paidAmount: 0.3,
      remainingAmount: 0,
      status: 'PAID',
    });
  });
});

describe('paidPercent', () => {
  it('rounds and caps at 100, and is 0 without a total', () => {
    expect(paidPercent(2000000, 8658000)).toBe(23);
    expect(paidPercent(10, 5)).toBe(100);
    expect(paidPercent(10, 0)).toBe(0);
  });
});

describe('withDerivedStatus', () => {
  const now = new Date('2026-06-01').getTime();

  it('marks an open past-due bill as OVERDUE', () => {
    const open = bill({ remainingAmount: 100, dueDate: '2026-05-01' });

    expect(withDerivedStatus(open, now).status).toBe('OVERDUE');
  });

  it('keeps PAID, CANCELLED and DRAFT bills unchanged', () => {
    (['PAID', 'CANCELLED', 'DRAFT'] as const).forEach((status) => {
      const settled = bill({ status, remainingAmount: 100, dueDate: '2026-05-01' });

      expect(withDerivedStatus(settled, now)).toBe(settled);
    });
  });

  it('keeps the status when not yet due or nothing remains', () => {
    expect(
      withDerivedStatus(bill({ remainingAmount: 100, dueDate: '2026-07-01' }), now).status
    ).toBe('UNPAID');
    expect(withDerivedStatus(bill({ remainingAmount: 0, dueDate: '2026-05-01' }), now).status).toBe(
      'UNPAID'
    );
  });
});

describe('summarizePurchases', () => {
  it('totals amounts and counts past-due remaining debt', () => {
    const now = new Date('2026-06-01').getTime();
    const summary = summarizePurchases(
      [
        bill({ totalAmount: 100.1, paidAmount: 0, remainingAmount: 100.1, dueDate: '2026-05-01' }),
        bill({
          totalAmount: 200.2,
          paidAmount: 100,
          remainingAmount: 100.2,
          dueDate: '2026-09-01',
        }),
      ],
      now
    );

    expect(summary).toEqual({
      totalAmount: 300.3,
      paidAmount: 100,
      remainingAmount: 200.3,
      overdueAmount: 100.1,
      overdueCount: 1,
      billCount: 2,
    });
  });
});

describe('applyPayment limits', () => {
  const bill = { totalAmount: 1000, paidAmount: 0 };

  it('rejects a payment above what is still owed', () => {
    expect(() => applyPayment(bill, 5000)).toThrow(RangeError);
    expect(() => applyPayment({ totalAmount: 1000, paidAmount: 900 }, 100.01)).toThrow(RangeError);
  });

  it('rejects a zero, negative or invalid payment', () => {
    expect(() => applyPayment(bill, 0)).toThrow(RangeError);
    expect(() => applyPayment(bill, -5)).toThrow(RangeError);
    expect(() => applyPayment(bill, Number.NaN)).toThrow(RangeError);
  });

  it('accepts the exact remaining amount and settles the bill', () => {
    expect(applyPayment({ totalAmount: 1000, paidAmount: 900 }, 100)).toEqual({
      paidAmount: 1000,
      remainingAmount: 0,
      status: 'PAID',
    });
  });
});
