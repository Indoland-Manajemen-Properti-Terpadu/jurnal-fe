import {
  billsTotal,
  cashOut,
  clampAmount,
  emptyPaymentForm,
  mergePayableBills,
  paymentFormFromVoucher,
  toggleBill,
  toPaymentInput,
  toPaymentUpdateInput,
  totalToPay,
  validatePayment,
  type PayableBill,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import type { PaymentVoucher, PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';

const bill = (over: Partial<PayableBill> = {}): PayableBill => ({
  id: 'b1',
  number: 'BILL-1',
  date: '2026-11-01',
  dueDate: '2026-12-01',
  remaining: 10000,
  ...over,
});

const base = (over: Partial<PaymentFormValues> = {}): PaymentFormValues => ({
  ...emptyPaymentForm('BILL', '2026-11-05'),
  vendorId: 'v1',
  paymentMethodId: 'pm1',
  ...over,
});

describe('payment amounts', () => {
  it('chooses a bill with its whole balance and drops it again', () => {
    const chosen = toggleBill(base(), bill(), true);
    expect(chosen.amounts).toEqual({ b1: 10000 });
    expect(toggleBill(chosen, bill(), false).amounts).toEqual({});
  });

  it('clamps an amount between zero and the remaining balance', () => {
    expect(clampAmount(15000, 10000)).toBe(10000);
    expect(clampAmount(-5, 10000)).toBe(0);
    expect(clampAmount('abc', 10000)).toBe(0);
  });

  it('adds the bank fee on top of the payment without float drift', () => {
    expect(cashOut(0.1 + 0.2, 0)).toBe(0.3);
    expect(cashOut(50000, 2500)).toBe(52500);
  });

  it('totals bills or the advance depending on the mode', () => {
    const values = base({ amounts: { b1: 4000, b2: 1000.5 } });
    expect(billsTotal(values)).toBe(5000.5);
    expect(totalToPay(values)).toBe(5000.5);
    expect(totalToPay(base({ mode: 'ADVANCE', advanceAmount: 7000 }))).toBe(7000);
  });

  it('lists payable bills by due date and skips settled ones', () => {
    const make = (id: string, dueDate: string, remainingAmount: number) =>
      ({ id, number: id, date: '2026-11-01', dueDate, remainingAmount }) as PurchaseBill;
    const merged = mergePayableBills(
      [make('late', '2026-12-20', 5)],
      [make('soon', '2026-11-10', 5), make('done', '2026-11-01', 0)]
    );
    expect(merged.map((item) => item.id)).toEqual(['soon', 'late']);
  });
});

describe('validatePayment', () => {
  it('needs a vendor, a method and at least one bill', () => {
    const errors = validatePayment(base({ vendorId: '', paymentMethodId: '' }), [bill()]);
    expect(errors).toMatchObject({ vendor: true, method: true, noBill: true });
  });

  it('flags zero and over-paid bills', () => {
    const errors = validatePayment(base({ amounts: { b1: 0, b2: 99999 } }), [
      bill(),
      bill({ id: 'b2' }),
    ]);
    expect(errors.zeroIds).toEqual(['b1']);
    expect(errors.overIds).toEqual(['b2']);
  });

  it('refuses a payment date before a bill date', () => {
    const errors = validatePayment(base({ date: '2026-10-01', amounts: { b1: 100 } }), [bill()]);
    expect(errors.date).toBe('beforeBill');
  });

  it('accepts a valid advance', () => {
    const errors = validatePayment(base({ mode: 'ADVANCE', advanceAmount: 500 }), []);
    expect(errors.advanceAmount).toBe(false);
    expect(errors.noBill).toBe(false);
  });
});

describe('payment payloads', () => {
  it('sends bill lines for a bill voucher and no type', () => {
    const input = toPaymentInput(
      base({ amounts: { b1: 4000 }, referenceNumber: ' TRF-1 ', memo: '' })
    );
    expect(input).toEqual({
      transactionDate: '2026-11-05',
      vendor: 'v1',
      paymentMethod: 'pm1',
      referenceNumber: 'TRF-1',
      memo: undefined,
      items: [{ bill: 'b1', amount: 4000 }],
    });
  });

  it('sends the advance type and amount for an advance', () => {
    const input = toPaymentInput(
      base({ mode: 'ADVANCE', advanceAmount: 7000, purchaseOrderId: 'po1' })
    );
    expect(input).toMatchObject({ type: 'ADVANCE', amount: 7000, purchaseOrder: 'po1' });
    expect(input.items).toBeUndefined();
  });

  it('leaves the vendor and type out of an update', () => {
    const update = toPaymentUpdateInput(base({ mode: 'ADVANCE', advanceAmount: 7000 }));
    expect(update).not.toHaveProperty('vendor');
    expect(update).not.toHaveProperty('type');
    expect(update.purchaseOrder).toBeNull();
  });

  it('reads a saved voucher back into form values', () => {
    const doc = {
      type: 'BILL',
      vendor: { id: 'v1' },
      date: '2026-11-05',
      paymentMethod: { id: 'pm1' },
      referenceNumber: 'R',
      memo: 'm',
      lines: [{ billId: 'b1', amount: 5000 }],
      totalAmount: 5000,
      purchaseOrderId: null,
    } as unknown as PaymentVoucher;
    expect(paymentFormFromVoucher(doc)).toMatchObject({
      mode: 'BILL',
      vendorId: 'v1',
      paymentMethodId: 'pm1',
      amounts: { b1: 5000 },
    });
  });
});
