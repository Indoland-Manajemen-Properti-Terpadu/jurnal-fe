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
const doc = (id: string, status = 'POSTED', kind?: string) => ({ id, number: id, status, kind });
const kinds = (chain: DocumentChain) => chainSteps(chain).map((step) => step.kind);

describe('chainSteps', () => {
  it('lists the steps of the flow so a step still ahead is visible, and the first open one is next', () => {
    const steps = chainSteps(empty);
    expect(steps.map((step) => step.kind)).toEqual([
      'request',
      'procurement',
      'order',
      'receipt',
      'bill',
      'settlement',
      'voucher',
    ]);
    expect(steps[0].state).toBe('next');
    expect(steps.slice(1).every((step) => step.state === 'todo')).toBe(true);
  });

  it('skips request and procurement for an order made without a request', () => {
    const steps = chainSteps({ ...empty, purchaseOrders: [doc('po1', 'SENT')] });
    expect(steps.find((step) => step.kind === 'request')?.state).toBe('skipped');
    expect(steps.find((step) => step.kind === 'procurement')?.state).toBe('skipped');
    expect(steps.find((step) => step.kind === 'order')?.state).toBe('done');
    expect(steps.find((step) => step.kind === 'receipt')?.state).toBe('next');
  });

  it('shows the advance between order and receipt only when a DP request exists, and splits settlements off', () => {
    const chain = {
      ...empty,
      purchaseOrders: [doc('po1', 'SENT')],
      paymentRequests: [doc('dp1', 'APPROVED', 'DP'), doc('pp1', 'APPROVED', 'SETTLEMENT')],
    };
    expect(kinds(chain)).toEqual([
      'request',
      'procurement',
      'order',
      'advance',
      'receipt',
      'bill',
      'settlement',
      'voucher',
    ]);
    const steps = chainSteps(chain, { type: 'paymentRequest', id: 'dp1' });
    expect(steps.find((step) => step.kind === 'advance')?.current).toBe(true);
    expect(steps.find((step) => step.kind === 'settlement')?.current).toBe(false);
  });

  it('does not count a voided or cancelled document as done', () => {
    const steps = chainSteps({ ...empty, purchaseBills: [doc('b1', 'VOID')] });
    expect(steps.find((step) => step.kind === 'bill')?.state).not.toBe('done');
  });

  it('links each document to its own page and shows returns only once one exists', () => {
    expect(kinds(empty)).not.toContain('return');
    const steps = chainSteps(
      { ...empty, purchaseReturns: [doc('rb1')] },
      { type: 'purchaseReturn', id: 'rb1' }
    );
    const ret = steps.find((step) => step.kind === 'return');
    expect(ret?.documents[0].to).toBe('/purchases/returns/rb1');
    expect(ret?.current).toBe(true);
  });
});
