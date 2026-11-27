import { describe, expect, it } from 'vitest';
import { toBillPreview } from '@/module/purchases/infrastructure/purchaseBillPreview';

describe('toBillPreview', () => {
  it('keeps server precision and pending price-change context', () => {
    expect(
      toBillPreview({
        total: 1_100_000,
        finalAmount: 1_078_000,
        precision: 2,
        priceChangePending: true,
        pendingPriceChange: {
          id: 'change-1',
          purchaseOrder: { id: 'order-1', transactionNumber: 'PO-001' },
        },
      })
    ).toMatchObject({
      total: 1_100_000,
      precision: 2,
      priceChangePending: true,
      pendingPriceChange: { id: 'change-1', purchaseOrderId: 'order-1' },
    });
  });

  it('does not invent a total or precision when the server omits them', () => {
    expect(toBillPreview({})).toMatchObject({ total: null, precision: null });
  });

  it('maps no active price-change request to null', () => {
    expect(
      toBillPreview({
        total: 10,
        precision: 0,
        priceChangePending: false,
        pendingPriceChange: null,
      })
    ).toMatchObject({ priceChangePending: false, pendingPriceChange: null });
  });
});
