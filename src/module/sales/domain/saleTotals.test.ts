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

    expect(totals(items, 'nominal', 0, 'nominal', 50)).toEqual(
      legacyCalculate(items, 'nominal', 0, 'nominal', 50)
    );
  });

  it('charges VAT on the amount after the discount, as the server does', () => {
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
      taxTotal: 198000,
      total: 1998000,
      withholdingAmount: 50000,
      finalAmount: 1948000,
    });
  });

  it('matches the live service: two lines, 10% discount, 11% VAT on one, 2% withholding', () => {
    const result = totals(
      [
        { quantity: 1, unitPrice: 100000, rate: 11 },
        { quantity: 1, unitPrice: 50000, rate: 0 },
      ],
      'percentage',
      10,
      'percentage',
      2
    );

    expect(result).toEqual({
      subtotal: 150000,
      discountAmount: 15000,
      taxTotal: 9900,
      total: 144900,
      withholdingAmount: 2700,
      finalAmount: 142200,
    });
  });

  it('takes withholding from the subtotal after the discount, not before', () => {
    const result = totals(
      [{ quantity: 1, unitPrice: 100000, rate: 0 }],
      'nominal',
      20000,
      'percentage',
      2
    );

    expect(result.withholdingAmount).toBe(1600);
  });

  it('spreads the discount over the lines, rounds each line tax and adds them up (live case)', () => {
    const result = totals(
      [
        { quantity: 1, unitPrice: 33333, rate: 11 },
        { quantity: 1, unitPrice: 33333, rate: 11 },
        { quantity: 1, unitPrice: 33334, rate: 11 },
      ],
      'nominal',
      10000,
      'percentage',
      3
    );

    expect(result.taxTotal).toBe(9900.01);
    expect(result.total).toBe(99900.01);
    expect(result.withholdingAmount).toBe(2700);
  });

  it('gives the cent left over by rounding to the first line (live case)', () => {
    const result = totals(
      [
        { quantity: 1, unitPrice: 1000, rate: 11 },
        { quantity: 1, unitPrice: 1000, rate: 11 },
        { quantity: 1, unitPrice: 1000, rate: 11 },
      ],
      'nominal',
      100
    );

    expect(result.taxTotal).toBe(318.99);
    expect(result.total).toBe(3218.99);
  });

  it('takes each line its share of a nominal discount before its tax', () => {
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
    expect(result.taxTotal).toBe(78269.23);
    expect(result.total).toBe(1928269.23);
    expect(result.withholdingAmount).toBe(37000);
    expect(result.finalAmount).toBe(1891269.23);
  });

  it('taxes every line after its share of a discount that does not divide evenly', () => {
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
    expect(result.taxTotal).toBe(20.01);
    expect(result.total).toBe(220.01);
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

  it('applies a percentage discount before VAT and withholding', () => {
    const result = totals(
      [{ quantity: 1, unitPrice: 1000.5, rate: 11 }],
      'percentage',
      12.5,
      'percentage',
      2
    );

    expect(result.discountAmount).toBe(125.06);
    expect(result.taxTotal).toBe(96.3);
    expect(result.withholdingAmount).toBe(17.51);
    expect(result.total).toBe(971.74);
    expect(result.finalAmount).toBe(954.23);
  });

  it('ignores zero or negative discount and withholding values', () => {
    const result = totals([{ quantity: 1, unitPrice: 100, rate: 0 }], 'nominal', -5, 'nominal', 0);

    expect(result.discountAmount).toBe(0);
    expect(result.withholdingAmount).toBe(0);
  });

  it('does not hide a withholding larger than the total: the final amount goes below zero', () => {
    expect(
      totals([{ quantity: 1, unitPrice: 100, rate: 0 }], 'nominal', 0, 'nominal', 500).finalAmount
    ).toBe(-400);
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

  it('splits the tax out of the price, then discounts and taxes the price without tax', () => {
    const result = calculateSaleTotals({ ...input, isPriceIncludeTax: true });

    expect(result.subtotal).toBe(100000);
    expect(result.discountAmount).toBe(11100);
    expect(result.taxTotal).toBe(9779);
    expect(result.total).toBe(98679);
    expect(result.finalAmount).toBe(98679);
  });

  it('matches the live service for two lines with a percentage discount', () => {
    const result = calculateSaleTotals({
      lines: [
        { quantity: 1, unitPrice: 111000, taxRate: 11 },
        { quantity: 1, unitPrice: 50000, taxRate: 0 },
      ],
      discountType: 'percentage',
      discountValue: 10,
      withholdingType: 'percentage',
      withholdingValue: 2,
      isPriceIncludeTax: true,
    });

    expect(result).toEqual({
      subtotal: 150000,
      discountAmount: 15000,
      taxTotal: 9900,
      total: 144900,
      withholdingAmount: 2700,
      finalAmount: 142200,
    });
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

  it('is taken after the discount when there is one', () => {
    const result = calculateSaleTotals({ ...base, discountValue: 11100 });

    expect(result.total).toBe(98679);
    expect(result.withholdingAmount).toBe(1778);
    expect(result.finalAmount).toBe(96901);
  });
});
