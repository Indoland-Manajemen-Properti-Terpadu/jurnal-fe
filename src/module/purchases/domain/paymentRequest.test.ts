import { describe, expect, it } from 'vitest';
import {
  emptyPaymentRequestForm,
  hasPaymentRequestErrors,
  sameVendor,
  vendorLabel,
  vendorSubtotals,
  voucherProgress,
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

describe('settlement with several vendors', () => {
  const billVendor = { b1: 'v1', b2: 'v1', b3: 'v2' };
  const limits = { requestable: { b1: 100, b2: 200, b3: 300 }, billVendor };
  const multi = (amounts: Record<string, number>, vendorIds: string[]) => ({
    ...emptyPaymentRequestForm('SETTLEMENT', '2026-11-25'),
    amounts,
    vendorIds,
  });

  it('sends the chosen vendors next to the bills, as the service takes them', () => {
    const input = toPaymentRequestInput(multi({ b1: 100, b3: 300 }, ['v1', 'v2']));

    expect(input.vendors).toEqual(['v1', 'v2']);
    expect(input.items).toEqual([
      { bill: 'b1', amount: 100 },
      { bill: 'b3', amount: 300 },
    ]);
  });

  it('keeps the vendors in an update too', () => {
    expect(toPaymentRequestUpdate(multi({ b1: 100 }, ['v1'])).vendors).toEqual(['v1']);
  });

  it('does not send vendors for an advance request', () => {
    expect(toPaymentRequestInput(advance())).not.toHaveProperty('vendors');
  });

  it('asks for at least one bill of every vendor that was chosen', () => {
    const errors = validatePaymentRequestForm(multi({ b1: 100 }, ['v1', 'v2']), limits);

    expect(errors.vendors).toEqual({ v2: 'noBillForVendor' });
    expect(hasPaymentRequestErrors(errors)).toBe(true);
  });

  it('is fine when each chosen vendor has a bill picked', () => {
    const errors = validatePaymentRequestForm(multi({ b1: 100, b3: 300 }, ['v1', 'v2']), limits);

    expect(errors.vendors).toEqual({});
    expect(hasPaymentRequestErrors(errors)).toBe(false);
  });

  it('adds up what is asked from each vendor, in whole minor units', () => {
    const totals = vendorSubtotals({ b1: 100.1, b2: 200.2, b3: 300 }, billVendor);

    expect(totals).toEqual({ v1: 300.3, v2: 300 });
  });
});

describe('vendor wording of a request', () => {
  const doc = (overrides: object) =>
    ({
      vendor: { id: 'v1', name: 'PT Alfa' },
      isMultiVendor: false,
      vendorTotals: [],
      ...overrides,
    }) as unknown as import('@/module/purchases/domain/paymentRequest').PaymentRequest;
  const totals = [
    {
      vendorId: 'v1',
      vendorName: 'PT Alfa',
      amount: 1,
      billCount: 1,
      voucher: { id: 'p', number: 'PV/1', status: 'DRAFT' },
    },
    { vendorId: 'v2', vendorName: 'CV Mitra', amount: 2, billCount: 1, voucher: null },
  ];

  it('names the one vendor of an ordinary request', () => {
    expect(vendorLabel(doc({}))).toBe('PT Alfa');
  });

  it('names every vendor of a request with several', () => {
    expect(vendorLabel(doc({ isMultiVendor: true, vendorTotals: totals }))).toBe(
      'PT Alfa, CV Mitra'
    );
  });

  it('has no name when the service sent no vendor', () => {
    expect(vendorLabel(doc({ vendor: null }))).toBe('');
  });

  it('counts the vendors that already have a voucher', () => {
    expect(voucherProgress(doc({ isMultiVendor: true, vendorTotals: totals }))).toEqual({
      issued: 1,
      total: 2,
    });
  });

  it('has nothing to count for a request with one vendor', () => {
    expect(voucherProgress(doc({}))).toBeNull();
  });
});
