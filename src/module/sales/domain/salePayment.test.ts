import { describe, expect, it } from 'vitest';
import { emptyPaymentForm, toPaymentPayload, validatePayment } from './salePayment';

const valid = () => ({
  ...emptyPaymentForm('2026-11-05', 1000),
  depositAccount: 'acc-1',
  paymentMethod: 'pm-1',
});

describe('validatePayment', () => {
  it('accepts a payment equal to what is still owed', () => {
    expect(validatePayment(valid(), 1000)).toEqual({});
  });

  it('refuses zero, negative and above-remaining amounts', () => {
    expect(validatePayment({ ...valid(), amount: 0 }, 1000).amount).toBe(
      'validation.amountPositive'
    );
    expect(validatePayment({ ...valid(), amount: -5 }, 1000).amount).toBe(
      'validation.amountPositive'
    );
    expect(validatePayment({ ...valid(), amount: 1000.01 }, 1000).amount).toBe(
      'validation.amountExceedsRemaining'
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
    const payload = toPaymentPayload('sale-1', {
      ...valid(),
      tags: ['t-1'],
      attachments: [file],
      memo: '  ',
    });
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
