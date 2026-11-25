import { advanceStepProgress, receiptBlockReason } from './orderAdvance';
import { orderActions } from './purchaseActions';
import type { OrderAdvanceState, PurchaseOrder } from './purchaseDocuments';

const state = (overrides: Partial<OrderAdvanceState> = {}): OrderAdvanceState => ({
  mode: 'BILL',
  amount: 100,
  paidAmount: 0,
  billed: false,
  paid: false,
  postedAmount: 0,
  recognizedAmount: 0,
  heldAmount: 0,
  step: 'CREATE_BILL',
  stepLabel: 'Catat faktur DP',
  canCreateBill: true,
  receiptAllowed: true,
  receiptBlockReason: null,
  bills: [],
  paymentRequests: [],
  paymentVouchers: [],
  ...overrides,
});

const order = (advanceState: OrderAdvanceState | null, overrides = {}) =>
  ({
    status: 'SENT',
    withReceipt: true,
    billedAmount: 0,
    payableAmount: 100,
    advance: { available: 50 },
    advanceState,
    items: [{ receivedQty: 0, billedQty: 0 }],
    ...overrides,
  }) as unknown as PurchaseOrder;

describe('receiptBlockReason', () => {
  it('is empty for an order without an advance, and when receiving is allowed', () => {
    expect(receiptBlockReason(order(null))).toBeNull();
    expect(receiptBlockReason(order(state()))).toBeNull();
  });

  it("gives the service's reason while the advance blocks the receipt", () => {
    const blocked = state({ receiptAllowed: false, receiptBlockReason: 'Bayar DP dulu' });

    expect(receiptBlockReason(order(blocked))).toBe('Bayar DP dulu');
  });

  it('still blocks, with no words, when the service gives no reason', () => {
    expect(receiptBlockReason(order(state({ receiptAllowed: false })))).toBe('');
  });
});

describe('advanceStepProgress', () => {
  it('numbers the steps of the bill route, and marks the last one done', () => {
    expect(advanceStepProgress('BILL', 'CREATE_BILL')).toEqual({ index: 0, total: 7, done: false });
    expect(advanceStepProgress('BILL', 'PAY_VOUCHER')).toEqual({ index: 5, total: 7, done: false });
    expect(advanceStepProgress('BILL', 'PAID')).toEqual({ index: 6, total: 7, done: true });
  });

  it('has no bill step on the request route', () => {
    expect(advanceStepProgress('REQUEST', 'CREATE_REQUEST')).toEqual({
      index: 0,
      total: 5,
      done: false,
    });
  });
});

describe('orderActions with an advance state', () => {
  it('hides "Ajukan DP" when the advance goes through a bill', () => {
    expect(orderActions(order(state({ mode: 'BILL' }))).requestAdvance).toBe(false);
  });

  it('keeps "Ajukan DP" when the advance goes through a payment request', () => {
    expect(orderActions(order(state({ mode: 'REQUEST' }))).requestAdvance).toBe(true);
  });

  it("keeps today's behaviour for an order with no advance state", () => {
    expect(orderActions(order(null)).requestAdvance).toBe(true);
  });
});
