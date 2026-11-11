import { describe, expect, it } from 'vitest';
import {
  emptyPaymentForm,
  allocationGap,
  fillRestAmount,
  overpaymentOf,
  paymentKind,
  toPaymentPayload,
  unallocatedAmount,
  validatePayment,
  type PaymentTarget,
} from './salePayment';

const valid = () => ({
  ...emptyPaymentForm('2026-11-05', 1000),
  depositAccount: 'acc-1',
  paymentMethod: 'pm-1',
});

describe('validatePayment', () => {
  it('accepts a payment equal to what is still owed', () => {
    expect(validatePayment(valid(), 1000)).toEqual({});
  });

  it('accepts a payment above what is owed; the excess is booked server side', () => {
    expect(validatePayment({ ...valid(), amount: 1500 }, 1000)).toEqual({});
  });

  it('refuses zero and negative amounts', () => {
    expect(validatePayment({ ...valid(), amount: 0 }, 1000).amount).toBe(
      'validation.amountPositive'
    );
    expect(validatePayment({ ...valid(), amount: -5 }, 1000).amount).toBe(
      'validation.amountPositive'
    );
  });

  it('compares in cents so a float tail does not block a full payment', () => {
    expect(validatePayment({ ...valid(), amount: 0.3 }, 0.1 + 0.2)).toEqual({});
  });

  it('requires the deposit account, the method and the date', () => {
    const errors = validatePayment(
      { ...valid(), depositAccount: '', paymentMethod: '', paymentDate: '' },
      1000
    );
    expect(errors).toMatchObject({
      depositAccount: 'validation.depositAccountRequired',
      paymentMethod: 'validation.paymentMethodRequired',
      paymentDate: 'validation.paymentDateRequired',
    });
  });

  it('refuses more than five files and a file above 5 MB', () => {
    const file = (size: number) => ({ size }) as File;
    expect(
      validatePayment({ ...valid(), attachments: Array.from({ length: 6 }, () => file(1)) }, 1000)
        .attachments
    ).toBe('validation.filesTooMany');
    expect(
      validatePayment({ ...valid(), attachments: [file(6 * 1024 * 1024)] }, 1000).attachments
    ).toBe('validation.fileTooLarge');
  });
});

describe('toPaymentPayload', () => {
  it('carries tags and files and drops an empty memo', () => {
    const file = new File(['x'], 'a.txt');
    const payload = toPaymentPayload(
      'sale-1',
      {
        ...valid(),
        tags: ['t-1'],
        attachments: [file],
        memo: '  ',
      },
      1000
    );
    expect(payload).toMatchObject({
      sale: 'sale-1',
      depositAccount: 'acc-1',
      paymentMethod: 'pm-1',
      amount: 1000,
      tags: ['t-1'],
      attachments: [file],
      memo: null,
    });
  });
});

const target: PaymentTarget = {
  remaining: 1000,
  outstandingLateFee: 100,
  items: [
    { id: 'i-1', outstandingAmount: 600 },
    { id: 'i-2', outstandingAmount: 300 },
  ],
};
const partial = (extra = {}) => ({ ...valid(), amount: 500, ...extra });

describe('paymentKind and overpaymentOf', () => {
  it('sorts a payment against the outstanding amount in cents', () => {
    expect(paymentKind(999.99, 1000)).toBe('partial');
    expect(paymentKind(1000, 1000)).toBe('full');
    expect(paymentKind(1000.01, 1000)).toBe('overpaid');
    expect(paymentKind(0.3, 0.1 + 0.2)).toBe('full');
  });

  it('reports the excess, never negative', () => {
    expect(overpaymentOf(1250.5, 1000)).toBe(250.5);
    expect(overpaymentOf(400, 1000)).toBe(0);
  });
});

describe('manual allocation of a partial payment', () => {
  it('needs the lines and the fee to add up to the amount', () => {
    const values = partial({ itemAmounts: { 'i-1': 300 }, lateFee: 100 });
    expect(validatePayment(values, 1000, target).allocation).toBe('validation.allocationMismatch');
    expect(
      validatePayment(partial({ itemAmounts: { 'i-1': 400 }, lateFee: 100 }), 1000, target)
    ).toEqual({});
  });

  it('refuses a line above its open balance and a fee above the open fee', () => {
    const errors = validatePayment(
      partial({ itemAmounts: { 'i-2': 400 }, lateFee: 150 }),
      1000,
      target
    );
    expect(errors['item:i-2']).toBe('validation.allocationExceedsItem');
    expect(errors.lateFee).toBe('validation.allocationExceedsLateFee');
  });

  it('skips the allocation checks for automatic mode and for full or larger payments', () => {
    expect(validatePayment(partial({ allocation: 'auto' }), 1000, target)).toEqual({});
    expect(validatePayment({ ...valid(), amount: 1200 }, 1000, target)).toEqual({});
  });

  it('shows what is not yet allocated and fills a line with the smaller of balance and rest', () => {
    const values = partial({ itemAmounts: { 'i-1': 200 }, lateFee: 50 });
    expect(unallocatedAmount(values)).toBe(250);
    expect(fillRestAmount(values, 0, 300)).toBe(250);
    expect(fillRestAmount(values, 0, 100)).toBe(100);
    expect(fillRestAmount(values, 200, 600)).toBe(450);
  });
});

describe('toPaymentPayload allocation', () => {
  it('sends lines and fee for a manual part payment, without empty lines', () => {
    const payload = toPaymentPayload(
      'sale-1',
      partial({ itemAmounts: { 'i-1': 400, 'i-2': 0 }, lateFee: 100 }),
      1000
    );
    expect(payload.items).toEqual([{ saleItem: 'i-1', amount: 400 }]);
    expect(payload.lateFeeAmount).toBe(100);
    expect(payload.autoAllocate).toBeUndefined();
  });

  it('sends only autoAllocate for an automatic part payment', () => {
    const payload = toPaymentPayload('sale-1', partial({ allocation: 'auto' }), 1000);
    expect(payload.autoAllocate).toBe(true);
    expect(payload.items).toBeUndefined();
  });

  it('sends no allocation when the payment settles or exceeds the invoice', () => {
    for (const amount of [1000, 1500]) {
      const payload = toPaymentPayload(
        'sale-1',
        { ...valid(), amount, allocation: 'auto', itemAmounts: { 'i-1': 5 } },
        1000
      );
      expect(payload.items).toBeUndefined();
      expect(payload.autoAllocate).toBeUndefined();
      expect(payload.lateFeeAmount).toBeUndefined();
    }
  });
});

describe('allocationGap', () => {
  it('is what is still to place, negative when too much is placed, 0 when exact', () => {
    expect(allocationGap(partial({ itemAmounts: { 'i-1': 200 }, lateFee: 50 }))).toBe(250);
    expect(allocationGap(partial({ itemAmounts: { 'i-1': 400 }, lateFee: 100 }))).toBe(0);
    expect(allocationGap(partial({ itemAmounts: { 'i-1': 600, 'i-2': 100 } }))).toBe(-200);
  });

  it('works in cents so a float tail does not show a phantom gap', () => {
    expect(allocationGap(partial({ amount: 0.3, itemAmounts: { 'i-1': 0.1, 'i-2': 0.2 } }))).toBe(
      0
    );
  });
});
