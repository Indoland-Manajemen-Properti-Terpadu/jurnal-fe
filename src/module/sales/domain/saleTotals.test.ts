import { describe, expect, it } from 'vitest';
import { calculateSaleTotals, lineAmount, remainingAfterPayment } from './saleTotals';

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

const totals = (
  items: LegacyItem[],
  discountType: 'percentage' | 'nominal' = 'nominal',
  discountValue = 0,
  withholdingType: 'percentage' | 'nominal' = 'nominal',
  withholdingValue = 0
) =>
  calculateSaleTotals({
    lines: items.map(({ quantity, unitPrice, rate }) => ({ quantity, unitPrice, taxRate: rate })),
    discountType,
    discountValue,
    withholdingType,
    withholdingValue,
  });

describe('calculateSaleTotals', () => {
  it('matches the legacy float result when there is no discount (nothing to charge tax before)', () => {
    const items = [{ quantity: 1, unitPrice: 100, rate: 0 }];

    expect(totals(items, 'nominal', 0, 'nominal', 500)).toEqual(
      legacyCalculate(items, 'nominal', 0, 'nominal', 500)
    );
  });

  it('charges VAT on the subtotal before the discount and withholds on the subtotal, as the server does', () => {
    const result = totals(
      [{ quantity: 2, unitPrice: 1000000, rate: 11 }],
      'percentage',
      10,
      'nominal',
      50000
    );

    expect(result).toEqual({
      subtotal: 2000000,
      discountAmount: 200000,
      taxTotal: 220000,
      total: 2020000,
      withholdingAmount: 50000,
      finalAmount: 1970000,
    });
  });

  it('lets a discount leave the tax alone: only taxed lines carry tax, on their full price', () => {
    const result = totals(
      [
        { quantity: 3, unitPrice: 250000, rate: 11 },
        { quantity: 1, unitPrice: 1200000, rate: 0 },
      ],
      'nominal',
      100000,
      'percentage',
      2
    );

    expect(result.subtotal).toBe(1950000);
    expect(result.discountAmount).toBe(100000);
    expect(result.taxTotal).toBe(82500);
    expect(result.total).toBe(1932500);
    expect(result.withholdingAmount).toBe(39000);
    expect(result.finalAmount).toBe(1893500);
  });

  it('never lowers the tax with a discount, even one that does not divide over the lines', () => {
    const result = totals(
      [
        { quantity: 1, unitPrice: 100, rate: 10 },
        { quantity: 1, unitPrice: 100, rate: 10 },
        { quantity: 1, unitPrice: 100, rate: 10 },
      ],
      'nominal',
      100
    );

    expect(result.discountAmount).toBe(100);
    expect(result.taxTotal).toBe(30);
    expect(result.total).toBe(230);
  });

  it('adds decimal amounts without float drift', () => {
    const result = totals([
      { quantity: 1, unitPrice: 0.1, rate: 0 },
      { quantity: 1, unitPrice: 0.2, rate: 0 },
    ]);

    expect(result.subtotal).toBe(0.3);
    expect(result.total).toBe(0.3);
  });

  it('keeps a decimal amount: 1500.50 with decimals in quantity', () => {
    const result = totals([{ quantity: 2.5, unitPrice: 1500.5, rate: 0 }]);

    expect(result.subtotal).toBe(3751.25);
  });

  it('rounds 11% tax half up to the cent per line (3 x 1500.50 = 495.165)', () => {
    const result = totals([{ quantity: 3, unitPrice: 1500.5, rate: 11 }]);

    expect(result.subtotal).toBe(4501.5);
    expect(result.taxTotal).toBe(495.17);
    expect(result.total).toBe(4996.67);
  });

  it('rounds 11% of a value that does not divide evenly', () => {
    expect(totals([{ quantity: 1, unitPrice: 333.33, rate: 11 }]).taxTotal).toBe(36.67);
    expect(totals([{ quantity: 1, unitPrice: 1000.01, rate: 11 }]).taxTotal).toBe(110);
  });

  it('applies a percentage discount while VAT and withholding stay on the subtotal', () => {
    const result = totals(
      [{ quantity: 1, unitPrice: 1000.5, rate: 11 }],
      'percentage',
      12.5,
      'percentage',
      2
    );

    expect(result.discountAmount).toBe(125.06);
    expect(result.taxTotal).toBe(110.06);
    expect(result.withholdingAmount).toBe(20.01);
    expect(result.total).toBe(985.5);
    expect(result.finalAmount).toBe(965.49);
  });

  it('ignores zero or negative discount and withholding values', () => {
    const result = totals([{ quantity: 1, unitPrice: 100, rate: 0 }], 'nominal', -5, 'nominal', 0);

    expect(result.discountAmount).toBe(0);
    expect(result.withholdingAmount).toBe(0);
  });

  it('floors the final amount at zero', () => {
    expect(
      totals([{ quantity: 1, unitPrice: 100, rate: 0 }], 'nominal', 0, 'nominal', 500).finalAmount
    ).toBe(0);
  });

  it('treats empty quantity and price as zero', () => {
    const empty = {
      quantity: '' as unknown as number,
      unitPrice: '' as unknown as number,
      rate: 11,
    };

    expect(totals([empty]).subtotal).toBe(0);
  });
});

describe('remainingAfterPayment', () => {
  it('subtracts in cents', () => {
    expect(remainingAfterPayment(1565.56, 565.56)).toBe(1000);
    expect(remainingAfterPayment(0.3, 0.1)).toBe(0.2);
    expect(remainingAfterPayment(100, 100)).toBe(0);
  });
});

describe('discount cap', () => {
  const line = { quantity: 1, unitPrice: 100000, taxRate: 0 };
  const base = { lines: [line], withholdingType: 'nominal' as const, withholdingValue: 0 };

  it('never lets the discount exceed the subtotal, so the total is never negative', () => {
    const result = calculateSaleTotals({ ...base, discountType: 'nominal', discountValue: 150000 });

    expect(result.discountAmount).toBe(100000);
    expect(result.total).toBe(0);
    expect(result.finalAmount).toBe(0);
  });

  it('caps a percentage above 100 the same way', () => {
    const result = calculateSaleTotals({ ...base, discountType: 'percentage', discountValue: 150 });

    expect(result.discountAmount).toBe(100000);
    expect(result.total).toBe(0);
  });

  it('keeps a normal discount as is', () => {
    const result = calculateSaleTotals({ ...base, discountType: 'percentage', discountValue: 10 });

    expect(result.discountAmount).toBe(10000);
    expect(result.total).toBe(90000);
  });
});

describe('price includes tax', () => {
  const line = { quantity: 1, unitPrice: 111000, taxRate: 11 };
  const input = {
    lines: [line],
    discountType: 'nominal' as const,
    discountValue: 11100,
    withholdingType: 'nominal' as const,
    withholdingValue: 0,
  };

  it('splits the tax out of the price, as the server does', () => {
    const result = calculateSaleTotals({ ...input, isPriceIncludeTax: true });

    expect(result.subtotal).toBe(100000);
    expect(result.taxTotal).toBe(11000);
    expect(result.discountAmount).toBe(11100);
    expect(result.total).toBe(99900);
    expect(result.finalAmount).toBe(99900);
  });

  it('adds the tax on top when the price excludes it', () => {
    const result = calculateSaleTotals({ ...input, discountValue: 0, isPriceIncludeTax: false });

    expect(result.subtotal).toBe(111000);
    expect(result.total).toBe(123210);
  });

  it('treats a line without tax the same either way', () => {
    const plain = { ...input, lines: [{ ...line, taxRate: 0 }], discountValue: 0 };

    expect(calculateSaleTotals({ ...plain, isPriceIncludeTax: true }).total).toBe(111000);
  });
});

describe('lineAmount', () => {
  it('multiplies quantity and price and rounds to the cent', () => {
    expect(lineAmount(2, 50000)).toBe(100000);
    expect(lineAmount(3, 1500.5)).toBe(4501.5);
    expect(lineAmount(0, 100)).toBe(0);
  });
});

describe('price includes tax: withholding', () => {
  const base = {
    lines: [{ quantity: 1, unitPrice: 111000, taxRate: 11 }],
    discountType: 'nominal' as const,
    withholdingType: 'percentage' as const,
    withholdingValue: 2,
    isPriceIncludeTax: true,
  };

  it('is a share of the amount without tax, as the server does', () => {
    const result = calculateSaleTotals({ ...base, discountValue: 0 });

    expect(result.withholdingAmount).toBe(2000);
    expect(result.finalAmount).toBe(109000);
  });

  it('keeps that base when there is also a discount', () => {
    const result = calculateSaleTotals({ ...base, discountValue: 11100 });

    expect(result.total).toBe(99900);
    expect(result.withholdingAmount).toBe(2000);
    expect(result.finalAmount).toBe(97900);
  });
});
