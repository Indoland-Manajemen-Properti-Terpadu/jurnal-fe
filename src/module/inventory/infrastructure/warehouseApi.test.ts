import { describe, expect, it } from 'vitest';
import {
  toBlockReasons,
  toMove,
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

describe('toMove', () => {
  it('marks a movement with a journal', () => {
    const move = toMove({
      id: 'm1',
      date: '2026-11-22T00:00:00.000Z',
      typeLabel: 'Penerimaan barang',
      isReversal: false,
      documentNumber: 'FPB/2026/11/0004',
      product: { name: 'Claude Max' },
      quantityIn: 1,
      quantityOut: 0,
      unitCost: 2000000,
      value: 2000000,
      journalTransaction: 'j1',
    });

    expect(move.hasJournal).toBe(true);
    expect(
      toMove({ ...{ id: 'm2', typeLabel: 'Pindah', product: { name: 'x' } } }).hasJournal
    ).toBe(false);
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

  it('returns nothing for an answer without reasons', () => {
    expect(toBlockReasons(undefined)).toEqual([]);
    expect(toBlockReasons({})).toEqual([]);
  });
});
