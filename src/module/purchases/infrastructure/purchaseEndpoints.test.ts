import { PURCHASE_API } from './purchaseEndpoints';

describe('purchase advance cancellation endpoint', () => {
  it('addresses one DP request under its PO/SPK', () => {
    expect(PURCHASE_API.orderAdvanceCancel('order-1', 'request-1')).toBe(
      '/v1/purchase-orders/order-1/advances/request-1/cancel'
    );
  });
});
