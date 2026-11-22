import { describe, expect, it } from 'vitest';
import { reconciliationGap, visibleWarehouses, type BalanceReport } from './stockBalance';

const report = (overrides: Partial<BalanceReport> = {}): BalanceReport => ({
  asOf: '2026-11-22',
  warehouses: [
    { id: 'a', code: 'GDG-001', name: 'Utama', isActive: true, isDefault: true },
    { id: 'b', code: 'GDG-002', name: 'Lama', isActive: false, isDefault: false },
    { id: 'c', code: 'GDG-003', name: 'Lama berisi', isActive: false, isDefault: false },
  ],
  rows: [
    {
      productId: 'p1',
      name: 'Kertas',
      sku: 'K',
      unit: 'rim',
      quantities: { a: 5, c: 2 },
      totalQty: 7,
      avgCost: 100,
      value: 700,
    },
  ],
  summary: { inventoryValue: 700, trackedProducts: 1, belowMinCount: 0, emptyCount: 0 },
  reconciliation: { matches: true, stockValue: 700, ledgerValue: 700 },
  ...overrides,
});

describe('reconciliationGap', () => {
  it('is zero when the books agree', () => {
    expect(reconciliationGap(report())).toBe(0);
  });

  it('is the size of the difference whichever side is larger', () => {
    expect(
      reconciliationGap(
        report({ reconciliation: { matches: false, stockValue: 5000, ledgerValue: 12000.5 } })
      )
    ).toBe(7000.5);
    expect(
      reconciliationGap(
        report({ reconciliation: { matches: false, stockValue: 9000, ledgerValue: 4000 } })
      )
    ).toBe(5000);
  });

  it('is null when the service sends no reconciliation', () => {
    expect(reconciliationGap(report({ reconciliation: null }))).toBeNull();
  });
});

describe('visibleWarehouses', () => {
  it('keeps active warehouses and inactive ones that still hold stock on that date', () => {
    expect(visibleWarehouses(report()).map((warehouse) => warehouse.id)).toEqual(['a', 'c']);
  });
});
