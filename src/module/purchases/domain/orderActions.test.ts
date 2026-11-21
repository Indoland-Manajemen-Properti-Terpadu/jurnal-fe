import { orderActions } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';

const order = (overrides: Record<string, unknown> = {}) =>
  ({
    status: 'SENT',
    withReceipt: true,
    billedAmount: 0,
    payableAmount: 100,
    advance: { available: 0 },
    items: [{ receivedQty: 0, billedQty: 0 }],
    ...overrides,
  }) as unknown as PurchaseOrder;

describe('orderActions', () => {
  it('lets a draft be edited, sent and voided but not received', () => {
    expect(orderActions(order({ status: 'DRAFT' }))).toEqual({
      edit: true,
      send: true,
      receive: false,
      bill: false,
      close: false,
      requestAdvance: false,
      void: true,
    });
  });

  it('lets a sent order that uses receipts take one, and not be billed directly', () => {
    expect(orderActions(order())).toMatchObject({
      receive: true,
      bill: false,
      edit: false,
      send: false,
    });
    expect(orderActions(order({ status: 'PARTIAL_RECEIVED' })).receive).toBe(true);
  });

  it('bills straight from a sent order that takes no receipt, until it is fully billed', () => {
    expect(orderActions(order({ withReceipt: false }))).toMatchObject({
      bill: true,
      receive: false,
    });
    expect(orderActions(order({ withReceipt: false, billedAmount: 100 })).bill).toBe(false);
  });

  it('offers the advance only while the order is live and the advance is not used up', () => {
    const advance = { available: 500 };
    expect(orderActions(order({ advance })).requestAdvance).toBe(true);
    expect(orderActions(order({ advance, status: 'RECEIVED' })).requestAdvance).toBe(true);
    expect(orderActions(order({ advance, status: 'DRAFT' })).requestAdvance).toBe(false);
    expect(orderActions(order({ advance, status: 'VOID' })).requestAdvance).toBe(false);
    expect(orderActions(order()).requestAdvance).toBe(false);
  });

  it('cannot void an order that already received or billed something', () => {
    expect(orderActions(order({ items: [{ receivedQty: 1, billedQty: 0 }] })).void).toBe(false);
    expect(orderActions(order({ items: [{ receivedQty: 0, billedQty: 2 }] })).void).toBe(false);
  });

  it('is closed to everything once closed, voided or completed', () => {
    for (const status of ['CLOSED', 'VOID', 'COMPLETED']) {
      expect(orderActions(order({ status }))).toEqual({
        edit: false,
        send: false,
        receive: false,
        bill: false,
        close: false,
        requestAdvance: false,
        void: false,
      });
    }
  });
});
