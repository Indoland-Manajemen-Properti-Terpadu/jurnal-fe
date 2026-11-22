import { describe, expect, it } from 'vitest';
import { documentTarget, hasCostBreakdown } from './stockMovement';

describe('documentTarget', () => {
  it('points a goods receipt, a transfer and a stock count to their kind', () => {
    expect(documentTarget('GoodsReceipt', 'r1')).toEqual({ kind: 'purchaseReceipt', id: 'r1' });
    expect(documentTarget('StockTransfer', 't1')).toEqual({ kind: 'transfer', id: 't1' });
    expect(documentTarget('StockOpname', 'o1')).toEqual({ kind: 'opname', id: 'o1' });
  });

  it('has no target for a source it does not know or without an id', () => {
    expect(documentTarget('SomethingNew', 'x')).toBeNull();
    expect(documentTarget('GoodsReceipt', '')).toBeNull();
  });
});

describe('hasCostBreakdown', () => {
  it('is false with no breakdown or when only the base price is there', () => {
    expect(hasCostBreakdown(null)).toBe(false);
    expect(hasCostBreakdown({ dpp: 3500, freight: 0, vat: 0 })).toBe(false);
    expect(hasCostBreakdown({ dpp: 0, freight: 0, vat: 0 })).toBe(false);
  });

  it('is true as soon as freight or tax is part of the price', () => {
    expect(hasCostBreakdown({ dpp: 3500, freight: 350, vat: 0 })).toBe(true);
    expect(hasCostBreakdown({ dpp: 3500, freight: 0, vat: 385 })).toBe(true);
  });
});
