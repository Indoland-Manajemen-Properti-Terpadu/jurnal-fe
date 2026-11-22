import { describe, expect, it } from 'vitest';
import {
  WAREHOUSE_LIMITS,
  emptyWarehouseInput,
  knownBlockers,
  stockStatus,
  validateWarehouse,
  type Warehouse,
} from './warehouse';

const valid = { ...emptyWarehouseInput(), code: 'GDG-005', name: 'Gudang Lt. 4' };

describe('stockStatus', () => {
  it('is empty at zero, whatever the minimum is', () => {
    expect(stockStatus(0, 20)).toBe('empty');
    expect(stockStatus(0, 0)).toBe('empty');
  });

  it('is below the minimum when under it', () => {
    expect(stockStatus(5, 20)).toBe('belowMin');
  });

  it('is safe at the minimum and when no minimum is set', () => {
    expect(stockStatus(20, 20)).toBe('safe');
    expect(stockStatus(3, 0)).toBe('safe');
  });
});

const base: Warehouse = {
  id: 'w1',
  code: 'GDG-002',
  name: 'Gudang Lt. 2',
  address: '',
  city: '',
  postalCode: '',
  phone: '',
  notes: '',
  picUser: null,
  isDefault: false,
  isActive: true,
  runningOpname: null,
  lastOpname: null,
  itemCount: 0,
  inventoryValue: 0,
  belowMinCount: 0,
  canDelete: false,
  codeLocked: true,
  createdAt: '',
  createdBy: null,
};

describe('knownBlockers', () => {
  it('has nothing to report for an empty, idle warehouse', () => {
    expect(knownBlockers(base)).toEqual([]);
  });

  it('reports the main warehouse, the running count and remaining stock, in that order', () => {
    const blockers = knownBlockers({
      ...base,
      isDefault: true,
      itemCount: 3,
      inventoryValue: 568000,
      runningOpname: { id: 'o1', number: 'SO/2026/11/0003' },
    });

    expect(blockers).toEqual([
      { kind: 'default' },
      { kind: 'stock', itemCount: 3, value: 568000 },
      { kind: 'opname', number: 'SO/2026/11/0003', id: 'o1' },
    ]);
  });
});

describe('validateWarehouse', () => {
  it('accepts a code and a name alone', () => {
    expect(validateWarehouse(valid)).toEqual({});
  });

  it.each(['', '   '])('requires a code (%j)', (code) => {
    expect(validateWarehouse({ ...valid, code }).code).toBe('codeRequired');
  });

  it('lets a new warehouse leave the code empty so the service numbers it', () => {
    expect(validateWarehouse({ ...valid, code: '' }, { codeOptional: true })).toEqual({});
    expect(validateWarehouse({ ...valid, code: 'GDG 1' }, { codeOptional: true }).code).toBe(
      'codeInvalid'
    );
  });

  it.each(['GDG 005', 'GDG_005', 'G'.repeat(WAREHOUSE_LIMITS.code + 1)])(
    'refuses a code with spaces, symbols or too long (%j)',
    (code) => {
      expect(validateWarehouse({ ...valid, code }).code).toBe('codeInvalid');
    }
  );

  it('requires a name and limits its length', () => {
    expect(validateWarehouse({ ...valid, name: '  ' }).name).toBe('nameRequired');
    expect(validateWarehouse({ ...valid, name: 'n'.repeat(WAREHOUSE_LIMITS.name + 1) }).name).toBe(
      'nameTooLong'
    );
    expect(validateWarehouse({ ...valid, name: 'n'.repeat(WAREHOUSE_LIMITS.name) })).toEqual({});
  });

  it('checks the phone only when one is given', () => {
    expect(validateWarehouse({ ...valid, phone: '' })).toEqual({});
    expect(validateWarehouse({ ...valid, phone: '+62 21-5150123' })).toEqual({});
    expect(validateWarehouse({ ...valid, phone: 'abc' }).phone).toBe('phoneInvalid');
  });
});
