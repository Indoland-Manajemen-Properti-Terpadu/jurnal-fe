import { describe, expect, it } from 'vitest';
import {
  compatibleRequest,
  emptyPaymentForm,
  hasPayErrors,
  hasPaymentErrors,
  toPayInput,
  issueOptions,
  scopeAmount,
  toPaymentInput,
  validatePayForm,
  validatePaymentForm,
  voucherTotal,
  type ReadyRequest,
} from '@/module/purchases/domain/paymentForm';

const request = (id: string, vendorId: string, amount: number): ReadyRequest => ({
  id,
  number: `PP/${id}`,
  kind: 'SETTLEMENT',
  vendorId,
  vendorName: vendorId,
  amount,
  dueDate: null,
  target: 'FKT/1',
});

describe('voucher form', () => {
  it('lets requests of one vendor share a voucher and no one else', () => {
    const a = request('a', 'v1', 100);
    expect(compatibleRequest([], a)).toBe(true);
    expect(compatibleRequest([a], request('b', 'v1', 50))).toBe(true);
    expect(compatibleRequest([a], request('c', 'v2', 50))).toBe(false);
  });

  it('needs a date and at least one request', () => {
    expect(hasPaymentErrors(validatePaymentForm(emptyPaymentForm('2026-11-21'), []))).toBe(true);
    expect(validatePaymentForm(emptyPaymentForm(''), [request('a', 'v1', 1)]).date).toBe(
      'dateRequired'
    );
    expect(
      hasPaymentErrors(validatePaymentForm(emptyPaymentForm('2026-11-21'), [request('a', 'v1', 1)]))
    ).toBe(false);
  });

  it('sends only what was filled in', () => {
    const input = toPaymentInput({ ...emptyPaymentForm('2026-11-21'), memo: ' uji ' }, [
      request('a', 'v1', 1),
      request('b', 'v1', 2),
    ]);
    expect(input).toEqual({
      transactionDate: '2026-11-21',
      paymentRequests: ['a', 'b'],
      memo: 'uji',
    });
  });

  it('adds the amounts without float drift', () => {
    expect(voucherTotal([request('a', 'v', 0.1), request('b', 'v', 0.2)])).toBe(0.3);
  });
});

describe('pay form', () => {
  const ok = {
    paidAt: '2026-11-22',
    depositAccountId: 'acc',
    paymentMethodId: '',
    adminFee: '' as const,
    referenceNumber: 'TRF-001',
  };

  it('insists on a deposit account, which the server would otherwise default', () => {
    expect(validatePayForm({ ...ok, depositAccountId: '' }, true).depositAccountId).toBe(
      'depositRequired'
    );
    expect(hasPayErrors(validatePayForm(ok, true))).toBe(false);
  });

  it('requires a transfer reference and at least one proof attachment before payment', () => {
    expect(validatePayForm({ ...ok, referenceNumber: '  ' }, false)).toMatchObject({
      referenceNumber: 'referenceRequired',
      attachments: 'attachmentRequired',
    });
    expect(validatePayForm(ok, false).attachments).toBe('attachmentRequired');
    expect(validatePayForm(ok, true)).toEqual({});
  });

  it('rejects a negative fee and a missing date', () => {
    expect(validatePayForm({ ...ok, adminFee: -1 }, true).adminFee).toBe('feeInvalid');
    expect(validatePayForm({ ...ok, paidAt: '' }, true).paidAt).toBe('dateRequired');
  });

  it('leaves an empty fee to the payment method default', () => {
    expect(toPayInput(ok)).toEqual({
      paidAt: '2026-11-22',
      depositAccount: 'acc',
      referenceNumber: 'TRF-001',
    });
    expect(toPayInput({ ...ok, adminFee: 2500, referenceNumber: ' TRF ' })).toEqual({
      paidAt: '2026-11-22',
      depositAccount: 'acc',
      adminFee: 2500,
      referenceNumber: 'TRF',
    });
  });
});

describe('issuing vouchers for a request with several vendors', () => {
  const total = (vendorId: string, amount: number, voucher = false) => ({
    vendorId,
    vendorName: `Vendor ${vendorId}`,
    amount,
    billCount: 1,
    voucher: voucher ? { id: `pv-${vendorId}`, number: `PV/${vendorId}`, status: 'DRAFT' } : null,
  });
  const multi = (totals: ReturnType<typeof total>[]) =>
    ({
      isMultiVendor: true,
      vendorTotals: totals,
    }) as unknown as import('@/module/purchases/domain/paymentRequest').PaymentRequest;

  it('offers all vendors at once while none has a voucher', () => {
    const options = issueOptions(multi([total('v1', 100), total('v2', 200)]));

    expect(options.allAtOnce).toBe(true);
    expect(options.pending.map((vendor) => vendor.vendorId)).toEqual(['v1', 'v2']);
  });

  it('offers only the vendors that still lack a voucher once one was issued', () => {
    const options = issueOptions(multi([total('v1', 100, true), total('v2', 200)]));

    expect(options.allAtOnce).toBe(false);
    expect(options.pending.map((vendor) => vendor.vendorId)).toEqual(['v2']);
  });

  it('has no choice to make for a request with one vendor', () => {
    const options = issueOptions({ isMultiVendor: false, vendorTotals: [] } as never);

    expect(options.allAtOnce).toBe(false);
    expect(options.pending).toEqual([]);
  });

  it('adds up what the chosen scope pays', () => {
    const doc = multi([total('v1', 100.1), total('v2', 200.2)]);

    expect(scopeAmount(doc, 'all')).toBe(300.3);
    expect(scopeAmount(doc, 'v2')).toBe(200.2);
    expect(scopeAmount(multi([total('v1', 100, true), total('v2', 200)]), 'all')).toBe(200);
  });

  it('names the vendor in the voucher input when one vendor is chosen', () => {
    const picked = [request('a', 'v1', 100)];

    expect(toPaymentInput(emptyPaymentForm('2026-11-25'), picked, 'v2').vendor).toBe('v2');
    expect(toPaymentInput(emptyPaymentForm('2026-11-25'), picked)).not.toHaveProperty('vendor');
  });
});
