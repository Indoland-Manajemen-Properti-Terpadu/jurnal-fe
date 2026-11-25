import { describe, expect, it } from 'vitest';
import {
  availableQty,
  fillAllLines,
  isTransferValued,
  transferWarehouseChoices,
  validateTransfer,
  withoutIssue,
  type TransferInput,
} from './stockTransfer';
import type { BalanceReport } from './stockBalance';

const TODAY = '2026-11-22';

const base: TransferInput = {
  date: TODAY,
  fromWarehouse: 'a',
  toWarehouse: 'b',
  memo: '',
  lines: [{ product: 'p1', quantity: 5 }],
};

const available = (id: string) => ({ p1: 10, p2: 3 })[id] ?? 0;

describe('validateTransfer', () => {
  it('accepts a complete transfer', () => {
    const issues = validateTransfer(base, available, TODAY);

    expect(issues).toEqual({ lines: {} });
  });

  it('requires both warehouses and refuses the same one twice', () => {
    expect(validateTransfer({ ...base, fromWarehouse: '' }, available, TODAY).from).toBe(
      'fromRequired'
    );
    expect(validateTransfer({ ...base, toWarehouse: '' }, available, TODAY).to).toBe('toRequired');
    expect(validateTransfer({ ...base, toWarehouse: 'a' }, available, TODAY).to).toBe(
      'sameWarehouse'
    );
  });

  it('refuses a missing date and a date after today', () => {
    expect(validateTransfer({ ...base, date: '' }, available, TODAY).date).toBe('dateRequired');
    expect(validateTransfer({ ...base, date: '2026-11-23' }, available, TODAY).date).toBe(
      'futureDate'
    );
    expect(validateTransfer({ ...base, date: TODAY }, available, TODAY).date).toBeUndefined();
  });

  it('needs at least one line', () => {
    expect(validateTransfer({ ...base, lines: [] }, available, TODAY).noLines).toBe(true);
  });

  it('flags an empty product, a repeated product, no quantity and too much quantity per line', () => {
    const issues = validateTransfer(
      {
        ...base,
        lines: [
          { product: '', quantity: 1 },
          { product: 'p1', quantity: 5 },
          { product: 'p1', quantity: 1 },
          { product: 'p2', quantity: 0 },
          { product: 'p3', quantity: 4 },
        ],
      },
      available,
      TODAY
    );

    expect(issues.lines).toEqual({
      0: 'productRequired',
      2: 'duplicateProduct',
      3: 'quantityRequired',
      4: 'overAvailable',
    });
  });

  it('allows moving exactly what is available', () => {
    const issues = validateTransfer(
      { ...base, lines: [{ product: 'p1', quantity: 10 }] },
      available,
      TODAY
    );

    expect(issues.lines).toEqual({});
  });
});

describe('availableQty and fillAllLines', () => {
  const report = {
    rows: [
      { productId: 'p1', quantities: { a: 12, b: 0 } },
      { productId: 'p2', quantities: { a: 0, b: 4 } },
      { productId: 'p3', quantities: { a: 3 } },
    ],
  } as unknown as BalanceReport;

  it('reads what a warehouse holds, zero when it holds none', () => {
    expect(availableQty(report, 'p1', 'a')).toBe(12);
    expect(availableQty(report, 'p2', 'a')).toBe(0);
    expect(availableQty(report, 'nope', 'a')).toBe(0);
  });

  it('fills a line with the full quantity of every product the warehouse holds', () => {
    expect(fillAllLines(report, 'a')).toEqual([
      { product: 'p1', quantity: 12 },
      { product: 'p3', quantity: 3 },
    ]);
  });
});

describe('isTransferValued', () => {
  it('has a price only once the transfer was approved', () => {
    expect(isTransferValued('posted')).toBe(true);
    expect(isTransferValued('void')).toBe(true);
  });

  it('has no price while it waits or after it was refused, so no "Rp 0,00" is shown', () => {
    expect(isTransferValued('pending')).toBe(false);
    expect(isTransferValued('rejected')).toBe(false);
  });
});

describe('transferWarehouseChoices', () => {
  const warehouses = [
    { id: 'a', code: 'GDG-001', name: 'Utama' },
    { id: 'b', code: 'GDG-002', name: 'Cadangan' },
    { id: 'c', code: 'GDG-003', name: 'Bekasi' },
  ];
  const holder = (id: string) => (id === 'c' ? { number: 'SO/1' } : undefined);
  const label = (number: string) => `Sedang diopname ${number}`;

  it('lists every warehouse as "code · name"', () => {
    const choices = transferWarehouseChoices(warehouses, () => undefined, '', label);

    expect(choices.map((choice) => choice.label)).toEqual([
      'GDG-001 · Utama',
      'GDG-002 · Cadangan',
      'GDG-003 · Bekasi',
    ]);
    expect(choices.every((choice) => !choice.disabled)).toBe(true);
  });

  it('does not let the warehouse already chosen on the other side be chosen again', () => {
    const choices = transferWarehouseChoices(warehouses, () => undefined, 'a', label);

    expect(choices.find((choice) => choice.value === 'a')?.disabled).toBe(true);
    expect(choices.find((choice) => choice.value === 'b')?.disabled).toBe(false);
  });

  it('holds back a warehouse that is being counted and says which count holds it', () => {
    const choices = transferWarehouseChoices(warehouses, holder, '', label);
    const counted = choices.find((choice) => choice.value === 'c');

    expect(counted?.disabled).toBe(true);
    expect(counted?.label).toBe('GDG-003 · Bekasi · Sedang diopname SO/1');
  });
});

describe('withoutIssue', () => {
  it('drops only the issue of the field that changed', () => {
    const issues = {
      date: 'dateRequired',
      from: 'fromRequired',
      to: 'toRequired',
      lines: {},
    } as const;

    expect(withoutIssue(issues, 'from')).toEqual({
      date: 'dateRequired',
      to: 'toRequired',
      lines: {},
    });
  });

  it('keeps the line issues and the "no lines" note', () => {
    const issues = { from: 'fromRequired', noLines: true, lines: { 0: 'qtyRequired' } } as never;

    expect(withoutIssue(issues, 'from')).toEqual({ noLines: true, lines: { 0: 'qtyRequired' } });
  });
});
