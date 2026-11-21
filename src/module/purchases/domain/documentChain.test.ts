import { describe, expect, it } from 'vitest';
import { chainSteps, type DocumentChain } from '@/module/purchases/domain/documentChain';

const empty: DocumentChain = {
  purchaseRequests: [],
  purchaseOrders: [],
  goodsReceipts: [],
  purchaseBills: [],
  paymentRequests: [],
  purchasePayments: [],
  purchaseReturns: [],
};

describe('chainSteps', () => {
  it('always lists the six steps of the flow so a step still ahead is visible, and hides returns until one exists', () => {
    expect(chainSteps(empty).map((step) => step.kind)).toEqual([
      'request',
      'order',
      'receipt',
      'bill',
      'paymentRequest',
      'payment',
    ]);
  });

  it('links each document to its own page and marks the one on screen', () => {
    const steps = chainSteps(
      {
        ...empty,
        paymentRequests: [{ id: 'pp1', number: 'PP/1', status: 'APPROVED' }],
        purchaseReturns: [{ id: 'rb1', number: 'RB/1', status: 'POSTED' }],
      },
      { type: 'paymentRequest', id: 'pp1' }
    );
    const request = steps.find((step) => step.kind === 'paymentRequest');
    expect(request?.current).toBe(true);
    expect(request?.documents[0].to).toBe('/purchases/payment-requests/pp1');
    expect(steps.find((step) => step.kind === 'return')?.documents[0].to).toBe(
      '/purchases/returns/rb1'
    );
    expect(steps.find((step) => step.kind === 'bill')?.current).toBe(false);
  });
});
