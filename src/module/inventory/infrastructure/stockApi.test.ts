import { describe, expect, it } from 'vitest';
import {
  toBalanceQuery,
  toBalanceReport,
  toMovement,
  toMovementQuery,
  toStockCard,
} from './stockApi';

describe('toBalanceReport', () => {
  it('maps rows and keeps a missing value as null, never zero', () => {
    const report = toBalanceReport({
      asOf: '2026-11-22',
      warehouses: [{ id: 'a', code: 'GDG-001', name: 'Utama', isActive: true, isDefault: true }],
      rows: [
        { id: 'p1', name: 'Kertas', sku: 'K', unit: 'rim', quantities: { a: 5 }, totalQty: 5 },
        {
          id: 'p2',
          name: 'Map',
          sku: 'M',
          unit: 'pcs',
          quantities: { a: 2 },
          totalQty: 2,
          avgCost: 0,
          value: 0,
        },
      ],
      summary: { trackedProducts: 2, belowMinCount: 1, emptyCount: 0 },
    });

    expect(report.rows[0]).toMatchObject({ productId: 'p1', avgCost: null, value: null });
    expect(report.rows[1]).toMatchObject({ avgCost: 0, value: 0 });
    expect(report.summary.inventoryValue).toBeNull();
    expect(report.reconciliation).toBeNull();
  });

  it('reads the reconciliation when the service sends it', () => {
    const report = toBalanceReport({
      asOf: '2026-11-22',
      warehouses: [],
      rows: [],
      summary: { inventoryValue: 700, trackedProducts: 0, belowMinCount: 0, emptyCount: 0 },
      reconciliation: { matches: false, stockValue: 700, ledgerValue: 900 },
    });

    expect(report.reconciliation).toEqual({ matches: false, stockValue: 700, ledgerValue: 900 });
  });
});

describe('toBalanceQuery', () => {
  it('sends only what was chosen', () => {
    expect(toBalanceQuery({ asOf: '', warehouse: undefined, q: '  ' })).toEqual({});
    expect(toBalanceQuery({ asOf: '2026-11-01', warehouse: 'a', q: ' kertas ' })).toEqual({
      asOf: '2026-11-01',
      warehouse: 'a',
      q: 'kertas',
    });
  });
});

describe('toMovementQuery', () => {
  it('uses the names the service takes', () => {
    expect(
      toMovementQuery({
        startDate: '2026-11-01',
        endDate: '2026-11-30',
        warehouse: 'a',
        product: 'p',
        type: 'RECEIPT',
        page: 2,
        limit: 20,
      })
    ).toEqual({
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      warehouse: 'a',
      product: 'p',
      type: 'RECEIPT',
      page: 2,
      limit: 20,
    });
    expect(toMovementQuery({})).toEqual({});
  });
});

describe('toMovement', () => {
  const dto = {
    id: 'm1',
    date: '2026-11-22T00:00:00.000Z',
    type: 'RECEIPT',
    typeLabel: 'Penerimaan barang',
    isReversal: false,
    documentNumber: 'FPB/2026/11/0004',
    sourceType: 'GoodsReceipt',
    sourceId: 'r1',
    product: { id: 'p1', name: 'Kertas', sku: 'K', unit: 'rim' },
    warehouse: { id: 'a', code: 'GDG-001', name: 'Utama' },
    quantityIn: 1,
    quantityOut: 0,
    unitCost: 61600,
    value: 61600,
    journalTransaction: 'j1',
    costBreakdown: { dpp: 56000, freight: 5600, vat: 0 },
  };

  it('maps a movement with its journal and price breakdown', () => {
    expect(toMovement(dto)).toMatchObject({
      productId: 'p1',
      productName: 'Kertas',
      journalId: 'j1',
      costBreakdown: { dpp: 56000, freight: 5600, vat: 0 },
    });
  });

  it('has no journal id for a transfer and no breakdown when the service sends none', () => {
    const move = toMovement({ ...dto, journalTransaction: null, costBreakdown: null });

    expect(move.journalId).toBeNull();
    expect(move.costBreakdown).toBeNull();
  });

  it('keeps a missing price as null', () => {
    const move = toMovement({ ...dto, unitCost: undefined, value: undefined });

    expect(move).toMatchObject({ unitCost: null, value: null });
  });
});

describe('toStockCard', () => {
  it('maps the opening, closing and running balances', () => {
    const card = toStockCard({
      product: { id: 'p1', name: 'Kertas', sku: 'K', unit: 'rim', category: 'Other' },
      warehouse: null,
      from: null,
      to: null,
      transfersExcluded: true,
      opening: { quantity: 0, value: 0 },
      totalIn: 10,
      totalOut: 4,
      closing: { quantity: 6, value: 600 },
      rows: [
        {
          id: 'r1',
          date: '2026-11-22T00:00:00.000Z',
          type: 'OPNAME_GAIN',
          typeLabel: 'Penyesuaian opname (lebih)',
          isReversal: false,
          documentNumber: 'SO/1',
          sourceType: 'StockOpname',
          sourceId: 'o1',
          warehouse: { id: 'a', code: 'GDG-001', name: 'Utama' },
          quantityIn: 10,
          quantityOut: 0,
          balanceQty: 10,
          unitCost: 100,
          value: 1000,
          balanceValue: 1000,
          avgCost: 100,
          journalTransaction: 'j1',
        },
      ],
    });

    expect(card.warehouse).toBeNull();
    expect(card.closing).toEqual({ quantity: 6, value: 600 });
    expect(card.rows[0]).toMatchObject({ balanceQty: 10, balanceValue: 1000, journalId: 'j1' });
  });
});
