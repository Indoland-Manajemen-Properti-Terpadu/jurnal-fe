import { describe, expect, it } from 'vitest';
import type { Sale } from './sale';
import {
  calculateSaleTotals,
  filterSalesByTab,
  isPastDue,
  remainingAfterPayment,
  summarizeSales,
} from './saleTotals';

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
  it.each([
    [[{ quantity: 2, unitPrice: 1000000, rate: 11 }], 'percentage', 10, 'nominal', 50000],
    [[{ quantity: 1, unitPrice: 100, rate: 0 }], 'nominal', 0, 'nominal', 500],
    [
      [
        { quantity: 3, unitPrice: 250000, rate: 11 },
        { quantity: 1, unitPrice: 1200000, rate: 0 },
      ],
      'nominal',
      100000,
      'percentage',
      2,
    ],
  ] as const)(
    'matches the legacy float result for whole-rupiah input %#',
    (items, dt, dv, wt, wv) => {
      expect(totals([...items], dt, dv, wt, wv)).toEqual(
        legacyCalculate([...items], dt, dv, wt, wv)
      );
    }
  );

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

  it('applies a percentage discount and withholding to the subtotal', () => {
    const result = totals(
      [{ quantity: 1, unitPrice: 1000.5, rate: 11 }],
      'percentage',
      12.5,
      'percentage',
      2
    );

    expect(result.discountAmount).toBe(125.06);
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

const sale = (overrides: Partial<Sale>): Sale => ({
  id: 's',
  transactionNumber: 'INV',
  customer: null,
  emails: [],
  transactionDate: null,
  dueDate: null,
  tags: [],
  paymentTerm: null,
  isPriceIncludeTax: false,
  items: [],
  subtotal: 0,
  total: 0,
  finalAmount: 0,
  paidAmount: 0,
  remainingAmount: 0,
  attachments: [],
  status: 'DRAFT',
  deleted: false,
  createdAt: null,
  updatedAt: null,
  ...overrides,
});

const NOW = new Date('2026-06-15T00:00:00Z').getTime();

describe('sale list rules', () => {
  const overdue = sale({
    id: 'a',
    status: 'OPEN',
    remainingAmount: 100.1,
    finalAmount: 100.1,
    dueDate: '2026-06-01',
  });
  const paid = sale({ id: 'b', status: 'PAID', finalAmount: 200.2, paidAmount: 200.2 });
  const draft = sale({ id: 'c', status: 'DRAFT', finalAmount: 0.3 });
  const partial = sale({
    id: 'd',
    status: 'PARTIAL',
    finalAmount: 50,
    paidAmount: 10,
    remainingAmount: 40,
    dueDate: '2026-12-01',
  });
  const all = [overdue, paid, draft, partial];

  it('detects a past due sale only while money is outstanding', () => {
    expect(isPastDue(overdue, NOW)).toBe(true);
    expect(isPastDue(partial, NOW)).toBe(false);
    expect(isPastDue(paid, NOW)).toBe(false);
    expect(isPastDue(sale({ remainingAmount: 5, dueDate: null }), NOW)).toBe(false);
  });

  it('filters by tab', () => {
    const ids = (tab: string) => filterSalesByTab(all, tab, NOW).map((s) => s.id);

    expect(ids('all')).toEqual(['a', 'b', 'c', 'd']);
    expect(ids('OVERDUE')).toEqual(['a']);
    expect(ids('UNPAID')).toEqual(['a', 'd']);
    expect(ids('PAID')).toEqual(['b']);
    expect(ids('DRAFT')).toEqual(['c']);
  });

  it('sums the list in cents without drift, leaving the draft out', () => {
    expect(summarizeSales(all, NOW)).toEqual({
      totalAmount: 350.3,
      paidAmount: 210.2,
      remainingAmount: 140.1,
      overdueCount: 1,
    });
  });
});

describe('discount cap and non-receivable statuses', () => {
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

  const saleWith = (status: string, remaining: number): Sale =>
    ({
      id: status,
      status,
      finalAmount: remaining,
      paidAmount: 0,
      remainingAmount: remaining,
      dueDate: '2020-01-01',
    }) as unknown as Sale;

  it('does not treat a draft or void sale as overdue', () => {
    expect(isPastDue(saleWith('DRAFT', 500), Date.now())).toBe(false);
    expect(isPastDue(saleWith('VOID', 500), Date.now())).toBe(false);
    expect(isPastDue(saleWith('UNPAID', 500), Date.now())).toBe(true);
  });

  it('leaves draft and void sales out of the receivable summary', () => {
    const summary = summarizeSales(
      [saleWith('DRAFT', 500), saleWith('VOID', 700), saleWith('UNPAID', 300)],
      Date.now()
    );

    expect(summary).toMatchObject({
      totalAmount: 300,
      remainingAmount: 300,
      overdueCount: 1,
    });
  });
});
