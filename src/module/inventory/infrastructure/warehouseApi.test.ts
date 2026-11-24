import { describe, expect, it } from 'vitest';
import {
  toBlockReasons,
  toStockItem,
  toWarehouse,
  toWarehouseQuery,
  type WarehouseDto,
} from './warehouseApi';

const dto: WarehouseDto = {
  id: 'w1',
  code: 'GDG-001',
  name: 'Gudang Utama',
  isDefault: true,
  isActive: true,
};

describe('toWarehouse', () => {
  it('keeps a missing text field as an empty string and a missing person as null', () => {
    const warehouse = toWarehouse(dto);

    expect(warehouse.city).toBe('');
    expect(warehouse.address).toBe('');
    expect(warehouse.picUser).toBeNull();
    expect(warehouse.runningOpname).toBeNull();
    expect(warehouse.lastOpname).toBeNull();
    expect(warehouse.codeLocked).toBe(false);
    expect(warehouse.canDelete).toBe(false);
  });

  it('keeps a missing inventory value as null, never zero', () => {
    expect(toWarehouse(dto).inventoryValue).toBeNull();
    expect(toWarehouse({ ...dto, inventoryValue: 0 }).inventoryValue).toBe(0);
  });

  it('reads the running count and the person in charge', () => {
    const warehouse = toWarehouse({
      ...dto,
      picUser: { id: 'u1', name: 'Asep Anas' },
      runningOpname: { id: 'o1', number: 'SO/2026/11/0001' },
    });

    expect(warehouse.picUser).toEqual({ id: 'u1', name: 'Asep Anas' });
    expect(warehouse.runningOpname).toEqual({ id: 'o1', number: 'SO/2026/11/0001' });
  });
});

describe('toWarehouseQuery', () => {
  it('sends only the filters that were chosen', () => {
    expect(toWarehouseQuery({ search: '  ', page: 1 })).toEqual({ page: 1 });
    expect(toWarehouseQuery({ search: ' uji ', status: 'inactive' })).toEqual({
      q: 'uji',
      status: 'inactive',
    });
  });
});

describe('toStockItem', () => {
  it('derives the status from the quantity and the minimum', () => {
    const base = { productId: 'p', name: 'Kertas', sku: 'K', unit: 'rim', avgCost: 1, value: 1 };

    expect(toStockItem({ ...base, quantity: 0, minQty: 3 }).status).toBe('empty');
    expect(toStockItem({ ...base, quantity: 2, minQty: 3 }).status).toBe('belowMin');
    expect(toStockItem({ ...base, quantity: 2, minQty: 0 }).status).toBe('safe');
  });
});

describe('toBlockReasons', () => {
  it('reads the running count with its number', () => {
    const reasons = toBlockReasons({
      reasons: [
        {
          code: 'RUNNING_OPNAME',
          message: 'Gudang sedang diopname (SO/2026/11/0002).',
          opname: { id: 'o2', number: 'SO/2026/11/0002', status: 'counting' },
        },
      ],
    });

    expect(reasons).toEqual([{ kind: 'opname', number: 'SO/2026/11/0002', id: 'o2' }]);
  });

  it('puts the default warehouse first and a reason it does not know last', () => {
    const reasons = toBlockReasons({
      reasons: [
        { code: 'SOMETHING_NEW', message: 'Ada hal lain.' },
        { code: 'RUNNING_OPNAME', message: 'x', opname: { id: 'o', number: 'SO/1' } },
        { code: 'DEFAULT_WAREHOUSE', message: 'Ini gudang utama.' },
      ],
    });

    expect(reasons.map((reason) => reason.kind)).toEqual(['default', 'opname', 'other']);
    expect(reasons[2]).toEqual({ kind: 'other', message: 'Ada hal lain.' });
  });

  it('reads the exact codes the service uses', () => {
    const reasons = toBlockReasons({
      reasons: [
        { code: 'OPEN_PO', message: 'x', count: 2 },
        { code: 'HAS_STOCK', message: 'x', count: 4 },
        { code: 'IS_DEFAULT', message: 'x' },
      ],
    });

    expect(reasons).toEqual([
      { kind: 'default' },
      { kind: 'stock', itemCount: 4, value: null },
      { kind: 'orders', count: 2 },
    ]);
  });

  it('still understands the earlier spellings of the default and order codes', () => {
    const reasons = toBlockReasons({
      reasons: [
        { code: 'OPEN_PURCHASE_ORDER', message: 'x', count: 1 },
        { code: 'DEFAULT', message: 'x' },
      ],
    });

    expect(reasons.map((reason) => reason.kind)).toEqual(['default', 'orders']);
  });

  it('carries the stock value when the service sends it', () => {
    const reasons = toBlockReasons({
      reasons: [{ code: 'HAS_STOCK', message: 'x', count: 8, inventoryValue: 22959000 }],
    });

    expect(reasons).toEqual([{ kind: 'stock', itemCount: 8, value: 22959000 }]);
  });

  it('keeps a stock value of zero, but shows nothing when the service leaves the value out', () => {
    const zero = toBlockReasons({
      reasons: [{ code: 'HAS_STOCK', message: 'x', count: 1, inventoryValue: 0 }],
    });
    const hidden = toBlockReasons({ reasons: [{ code: 'HAS_STOCK', message: 'x', count: 1 }] });

    expect(zero[0]).toMatchObject({ kind: 'stock', value: 0 });
    expect(hidden[0]).toMatchObject({ kind: 'stock', value: null });
  });

  it('reads the transfers that wait for approval, between the orders and the count', () => {
    const reasons = toBlockReasons({
      reasons: [
        { code: 'RUNNING_OPNAME', message: 'x', opname: { id: 'o', number: 'SO/1' } },
        {
          code: 'OPEN_TRANSFER',
          message: 'x',
          count: 2,
          transfers: [
            { id: 't1', number: 'PDH/2026/11/0005' },
            { id: 't2', number: 'PDH/2026/11/0006' },
          ],
        },
        { code: 'OPEN_PURCHASE_ORDER', message: 'x', count: 1 },
      ],
    });

    expect(reasons.map((reason) => reason.kind)).toEqual(['orders', 'transfers', 'opname']);
    expect(reasons[1]).toEqual({
      kind: 'transfers',
      count: 2,
      transfers: [
        { id: 't1', number: 'PDH/2026/11/0005' },
        { id: 't2', number: 'PDH/2026/11/0006' },
      ],
    });
  });

  it('counts the listed transfers when the service sends no count, and none when it lists none', () => {
    const [counted] = toBlockReasons({
      reasons: [
        { code: 'OPEN_TRANSFER', message: 'x', transfers: [{ id: 't1', number: 'PDH/1' }] },
      ],
    });
    const [bare] = toBlockReasons({ reasons: [{ code: 'OPEN_TRANSFER', message: 'x' }] });

    expect(counted).toMatchObject({ kind: 'transfers', count: 1 });
    expect(bare).toEqual({ kind: 'transfers', count: null, transfers: [] });
  });

  it('returns nothing for an answer without reasons', () => {
    expect(toBlockReasons(undefined)).toEqual([]);
    expect(toBlockReasons({})).toEqual([]);
  });
});
