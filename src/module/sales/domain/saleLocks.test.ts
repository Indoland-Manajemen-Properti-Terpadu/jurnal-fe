import { describe, expect, it } from 'vitest';
import type { SaleItem } from './sale';
import { hasIssuedReturn } from './saleLocks';

const item = (returnedQty?: number): SaleItem => ({
  quantity: 1,
  unitPrice: 100,
  amount: 100,
  returnedQty,
});

describe('hasIssuedReturn', () => {
  it('is false when the API sent nothing about returns', () => {
    expect(hasIssuedReturn({ items: [item()] })).toBe(false);
  });

  it('is true when returns took money off the invoice', () => {
    expect(hasIssuedReturn({ returnedAmount: 50, items: [item(0)] })).toBe(true);
  });

  it('is true for a credit-only return, which leaves the amount at 0', () => {
    expect(hasIssuedReturn({ returnedAmount: 0, items: [item(0), item(2)] })).toBe(true);
  });
});
