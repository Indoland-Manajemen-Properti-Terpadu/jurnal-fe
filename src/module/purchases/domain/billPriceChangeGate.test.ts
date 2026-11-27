import { describe, expect, it } from 'vitest';
import { billPriceChangeGate } from '@/module/purchases/domain/billPriceChangeGate';

describe('billPriceChangeGate', () => {
  const base = {
    source: 'RECEIPT' as const,
    orderIds: ['po-1'],
    vendorInvoiceTotal: 120,
    previewTotal: 100,
    previewPrecision: 0,
    previewReady: true,
    priceChangePending: false,
  };

  it('allows saving a matching invoice after a fresh preview', () => {
    expect(billPriceChangeGate({ ...base, vendorInvoiceTotal: 100 })).toMatchObject({
      canSave: true,
      canRequest: false,
      splitOrders: false,
    });
  });

  it('blocks saving and permits a request when the invoice total differs', () => {
    expect(billPriceChangeGate(base)).toMatchObject({
      canSave: false,
      canRequest: true,
      splitOrders: false,
    });
  });

  it('requires separate invoices when a mismatched bill contains multiple orders', () => {
    expect(billPriceChangeGate({ ...base, orderIds: ['po-1', 'po-2'] })).toMatchObject({
      canSave: false,
      canRequest: false,
      splitOrders: true,
    });
  });

  it('blocks while the preview is stale or still loading', () => {
    expect(billPriceChangeGate({ ...base, previewReady: false })).toMatchObject({
      canSave: false,
      canRequest: false,
    });
  });

  it('blocks a bill while a price change is pending approval', () => {
    expect(billPriceChangeGate({ ...base, priceChangePending: true })).toMatchObject({
      canSave: false,
      canRequest: false,
      priceChangePending: true,
    });
  });

  it('blocks when a supplied invoice total cannot be compared at server precision', () => {
    expect(billPriceChangeGate({ ...base, previewPrecision: null })).toMatchObject({
      canSave: false,
      canRequest: false,
      comparisonUnknown: true,
    });
  });

  it('allows a fresh preview without an optional invoice total', () => {
    expect(billPriceChangeGate({ ...base, vendorInvoiceTotal: '' })).toMatchObject({
      canSave: true,
      canRequest: false,
    });
  });
});
