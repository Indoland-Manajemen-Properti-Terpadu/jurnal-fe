import { calculateTotals, remainingQty } from '@/module/purchases/domain/purchaseTotals';

const base = {
  isPriceIncludeTax: false,
  discountType: null,
  discountValue: 0,
  withholdingType: null,
  withholdingValue: 0,
} as const;

describe('calculateTotals', () => {
  it('matches the backend worked example (10 x 50.000, 5% discount, 11% tax, 2% withholding)', () => {
    const totals = calculateTotals({
      ...base,
      lines: [{ quantity: 10, unitPrice: 50000, taxRate: 11 }],
      discountType: 'percentage',
      discountValue: 5,
      withholdingType: 'percentage',
      withholdingValue: 2,
    });
    expect(totals).toEqual({
      subtotal: 500000,
      discountAmount: 25000,
      taxAmount: 52250,
      total: 527250,
      withholdingAmount: 9500,
      finalAmount: 517750,
    });
  });

  it('matches a live order (1 x 50.000, 5% discount, 11% tax, 2% withholding = 51.775)', () => {
    const totals = calculateTotals({
      ...base,
      lines: [{ quantity: 1, unitPrice: 50000, taxRate: 11 }],
      discountType: 'percentage',
      discountValue: 5,
      withholdingType: 'percentage',
      withholdingValue: 2,
    });
    expect(totals.finalAmount).toBe(51775);
    expect(totals.taxAmount).toBe(5225);
  });

  it('extracts the tax from a tax-inclusive price', () => {
    const totals = calculateTotals({
      ...base,
      isPriceIncludeTax: true,
      lines: [{ quantity: 1, unitPrice: 111000, taxRate: 11 }],
    });
    expect(totals.subtotal).toBe(100000);
    expect(totals.taxAmount).toBe(11000);
    expect(totals.total).toBe(111000);
  });

  it('never lets a nominal discount exceed the subtotal and shares it without losing a cent', () => {
    const totals = calculateTotals({
      ...base,
      lines: [
        { quantity: 1, unitPrice: 100, taxRate: 0 },
        { quantity: 1, unitPrice: 100, taxRate: 0 },
        { quantity: 1, unitPrice: 100, taxRate: 0 },
      ],
      discountType: 'nominal',
      discountValue: 1000,
    });
    expect(totals.discountAmount).toBe(300);
    expect(totals.total).toBe(0);
  });

  it('caps withholding at the total', () => {
    const totals = calculateTotals({
      ...base,
      lines: [{ quantity: 1, unitPrice: 1000, taxRate: 0 }],
      withholdingType: 'nominal',
      withholdingValue: 5000,
    });
    expect(totals.finalAmount).toBe(0);
  });
});

describe('remainingQty', () => {
  it('is never negative and ignores float noise', () => {
    expect(remainingQty(10, 3.1)).toBe(6.9);
    expect(remainingQty(1, 2)).toBe(0);
  });
});
