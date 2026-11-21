import { describe, expect, it } from 'vitest';
import {
  emptyPaymentRequestForm,
  hasPaymentRequestErrors,
  sameVendor,
  toPaymentRequestInput,
  toPaymentRequestUpdate,
  validatePaymentRequestForm,
  type RequestableBill,
} from '@/module/purchases/domain/paymentRequest';

const settlement = (amounts: Record<string, number>) => ({
  ...emptyPaymentRequestForm('SETTLEMENT', '2026-11-21'),
  amounts,
});
const advance = (over: object = {}) => ({
  ...emptyPaymentRequestForm('DP', '2026-11-21'),
  purchaseOrderId: 'po1',
  advanceAmount: 1000 as number | '',
  ...over,
});

describe('settlement validation', () => {
  const limits = { requestable: { b1: 2_330_000 } };

  it('needs a bill', () => {
    expect(validatePaymentRequestForm(settlement({}), limits).noBills).toBe('noBills');
  });

  it('rejects an amount above what is still free, the one the server refuses with 400', () => {
    const errors = validatePaymentRequestForm(settlement({ b1: 2_400_000 }), limits);
    expect(errors.bills.b1).toBe('amountTooHigh');
    expect(hasPaymentRequestErrors(errors)).toBe(true);
  });

  it('accepts the whole free amount and rejects zero and three decimals', () => {
    expect(
      hasPaymentRequestErrors(validatePaymentRequestForm(settlement({ b1: 2_330_000 }), limits))
    ).toBe(false);
    expect(validatePaymentRequestForm(settlement({ b1: 0 }), limits).bills.b1).toBe(
      'amountInvalid'
    );
    expect(validatePaymentRequestForm(settlement({ b1: 1.234 }), limits).bills.b1).toBe(
      'amountInvalid'
    );
  });
});

describe('advance validation', () => {
  it('needs an order and an amount within what the order still allows', () => {
    expect(validatePaymentRequestForm(advance({ purchaseOrderId: '' }), {} as never).order).toBe(
      'orderRequired'
    );
    expect(
      validatePaymentRequestForm(advance({ advanceAmount: '' }), { requestable: {} }).advance
    ).toBe('advanceInvalid');
    expect(
      validatePaymentRequestForm(advance({ advanceAmount: 5001 }), {
        requestable: {},
        available: 5000,
      }).advance
    ).toBe('advanceTooHigh');
    expect(
      hasPaymentRequestErrors(
        validatePaymentRequestForm(advance({ advanceAmount: 5000 }), {
          requestable: {},
          available: 5000,
        })
      )
    ).toBe(false);
  });
});

describe('payload', () => {
  it('builds a settlement from the chosen bills', () => {
    expect(toPaymentRequestInput(settlement({ b1: 10, b2: 20 }))).toEqual({
      kind: 'SETTLEMENT',
      transactionDate: '2026-11-21',
      items: [
        { bill: 'b1', amount: 10 },
        { bill: 'b2', amount: 20 },
      ],
    });
  });

  it('builds an advance with its order and account', () => {
    expect(toPaymentRequestInput(advance({ advanceAccountId: 'acc' }))).toEqual({
      kind: 'DP',
      transactionDate: '2026-11-21',
      purchaseOrder: 'po1',
      amount: 1000,
      advanceAccount: 'acc',
    });
  });

  it('never sends the kind or the order on update, which the server rejects', () => {
    const update = toPaymentRequestUpdate(advance({ memo: ' ubah ' }));
    expect(update).not.toHaveProperty('kind');
    expect(update).not.toHaveProperty('purchaseOrder');
    expect(update.memo).toBe('ubah');
  });
});

describe('sameVendor', () => {
  const bill = (vendorId: string): RequestableBill => ({
    id: vendorId,
    number: '',
    vendorInvoiceNumber: '',
    vendorId,
    vendorName: vendorId,
    dueDate: null,
    requestable: 1,
  });
  it('allows the first bill and the same vendor only', () => {
    expect(sameVendor([], bill('a'))).toBe(true);
    expect(sameVendor([bill('a')], bill('a'))).toBe(true);
    expect(sameVendor([bill('a')], bill('b'))).toBe(false);
  });
});
