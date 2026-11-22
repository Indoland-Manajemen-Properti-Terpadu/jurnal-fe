import { describe, expect, it } from 'vitest';
import {
  compatibleRequest,
  emptyPaymentForm,
  hasPayErrors,
  hasPaymentErrors,
  toPayInput,
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
    referenceNumber: '',
  };

  it('insists on a deposit account, which the server would otherwise default', () => {
    expect(validatePayForm({ ...ok, depositAccountId: '' }).depositAccountId).toBe(
      'depositRequired'
    );
    expect(hasPayErrors(validatePayForm(ok))).toBe(false);
  });

  it('rejects a negative fee and a missing date', () => {
    expect(validatePayForm({ ...ok, adminFee: -1 }).adminFee).toBe('feeInvalid');
    expect(validatePayForm({ ...ok, paidAt: '' }).paidAt).toBe('dateRequired');
  });

  it('leaves an empty fee to the payment method default', () => {
    expect(toPayInput(ok)).toEqual({ paidAt: '2026-11-22', depositAccount: 'acc' });
    expect(toPayInput({ ...ok, adminFee: 2500, referenceNumber: ' TRF ' })).toEqual({
      paidAt: '2026-11-22',
      depositAccount: 'acc',
      adminFee: 2500,
      referenceNumber: 'TRF',
    });
  });
});
