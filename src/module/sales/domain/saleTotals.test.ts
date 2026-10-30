import { describe, expect, it } from 'vitest';

/**
 * Characterization of the totals the create-sale modal computed inline before the extraction:
 * plain float arithmetic. These values are pinned from that implementation.
 */
type LegacyItem = { quantity: number; unitPrice: number; rate: number };

const legacyCalculate = (
  items: LegacyItem[],
  discountType: 'percentage' | 'nominal',
  discountValue: number,
  withholdingType: 'percentage' | 'nominal',
  withholdingValue: number
) => {
  let subtotal = 0;
  let taxTotal = 0;
  items.forEach((item) => {
    const lineTotal = (item.quantity || 0) * (item.unitPrice || 0);
    subtotal += lineTotal;
    taxTotal += (lineTotal * item.rate) / 100;
  });
  let discountAmount = 0;
  if (discountValue > 0) {
    discountAmount =
      discountType === 'percentage' ? (subtotal * discountValue) / 100 : discountValue;
  }
  let withholdingAmount = 0;
  if (withholdingValue > 0) {
    withholdingAmount =
      withholdingType === 'percentage' ? (subtotal * withholdingValue) / 100 : withholdingValue;
  }
  const total = subtotal - discountAmount + taxTotal;
  return {
    subtotal,
    discountAmount,
    taxTotal,
    total,
    withholdingAmount,
    finalAmount: Math.max(0, total - withholdingAmount),
  };
};

describe('legacy sale totals (characterization)', () => {
  it('computes whole-rupiah totals with 11% tax', () => {
    expect(
      legacyCalculate(
        [{ quantity: 2, unitPrice: 1000000, rate: 11 }],
        'percentage',
        10,
        'nominal',
        50000
      )
    ).toEqual({
      subtotal: 2000000,
      discountAmount: 200000,
      taxTotal: 220000,
      total: 2020000,
      withholdingAmount: 50000,
      finalAmount: 1970000,
    });
  });

  it('floors the final amount at zero', () => {
    expect(
      legacyCalculate([{ quantity: 1, unitPrice: 100, rate: 0 }], 'nominal', 0, 'nominal', 500)
        .finalAmount
    ).toBe(0);
  });

  it('shows the float artefacts the extraction removes', () => {
    const totals = legacyCalculate(
      [
        { quantity: 1, unitPrice: 0.1, rate: 0 },
        { quantity: 1, unitPrice: 0.2, rate: 0 },
      ],
      'nominal',
      0,
      'nominal',
      0
    );

    expect(totals.subtotal).toBe(0.30000000000000004);
  });

  it('leaves a sub-cent tax on a value that does not divide evenly', () => {
    const totals = legacyCalculate(
      [{ quantity: 3, unitPrice: 1500.5, rate: 11 }],
      'nominal',
      0,
      'nominal',
      0
    );

    expect(totals.taxTotal).toBeCloseTo(495.165, 10);
  });
});
