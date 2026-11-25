import {
  formatExample,
  groupNumberFormatTypes,
  numberFormatTypeHint,
  type NumberFormatTypeInfo,
} from './numberFormatTypes';

const info = (overrides: Partial<NumberFormatTypeInfo> = {}): NumberFormatTypeInfo => ({
  type: 'paymentRequest',
  label: 'Payment request',
  group: 'purchase',
  groupLabel: 'Pembelian',
  hasDefault: true,
  defaultPrefix: 'PR',
  defaultExample: 'PR/2026/11/0001',
  restartsEvery: 'MONTH',
  formatCount: 0,
  format: null,
  ...overrides,
});

describe('formatExample', () => {
  it('joins prefix, a five-digit number and suffix, with no year or month', () => {
    expect(formatExample('PR-', 12, '')).toBe('PR-00012');
    expect(formatExample('INV/', 1, '/A')).toBe('INV/00001/A');
  });

  it('keeps a number that is already longer than five digits', () => {
    expect(formatExample('X', 123456, '')).toBe('X123456');
  });
});

describe('groupNumberFormatTypes', () => {
  const all = [
    info({ type: 'stockTransfer', label: 'Pindah barang', group: 'stock', groupLabel: 'Stok' }),
    info({
      type: 'invoice',
      label: 'Faktur',
      group: 'general',
      groupLabel: 'Umum',
      hasDefault: false,
    }),
    info({ type: 'saleOrder', label: 'Pesanan penjualan', group: 'sale', groupLabel: 'Penjualan' }),
    info({ type: 'paymentRequest' }),
    info({ type: 'bill', label: 'Faktur vendor' }),
  ];

  it('lists the groups in a fixed order: general, sale, purchase, stock', () => {
    expect(groupNumberFormatTypes(all).map((group) => group.group)).toEqual([
      'Umum',
      'Penjualan',
      'Pembelian',
      'Stok',
    ]);
  });

  it('keeps the order the service gave inside a group', () => {
    const purchase = groupNumberFormatTypes(all).find((group) => group.group === 'Pembelian');

    expect(purchase?.items.map((item) => item.value)).toEqual(['paymentRequest', 'bill']);
    expect(purchase?.items[0].label).toBe('Payment request');
  });

  it('puts a group the service adds later after the known ones', () => {
    const groups = groupNumberFormatTypes([
      ...all,
      info({ type: 'asset', label: 'Aset', group: 'asset', groupLabel: 'Aset Tetap' }),
    ]);

    expect(groups.at(-1)?.group).toBe('Aset Tetap');
  });

  it('is empty when there are no types', () => {
    expect(groupNumberFormatTypes([])).toEqual([]);
  });
});

describe('numberFormatTypeHint', () => {
  it('says the site must set a format first for a type that has no default number', () => {
    expect(numberFormatTypeHint(info({ type: 'invoice', hasDefault: false }))).toEqual({
      kind: 'required',
    });
  });

  it('describes the default number while the site has no format of its own', () => {
    expect(numberFormatTypeHint(info())).toEqual({
      kind: 'default',
      example: 'PR/2026/11/0001',
      restartsEvery: 'MONTH',
    });
  });

  it('shows the next number of the format the site already has, and that it replaces the default', () => {
    const hint = numberFormatTypeHint(
      info({
        formatCount: 1,
        format: {
          id: 'f1',
          prefix: 'PR-',
          suffix: '',
          status: 'active',
          startNumber: 1,
          currentNumber: 12,
          nextNumber: 'PR-00012',
        },
      })
    );

    expect(hint).toEqual({ kind: 'active', next: 'PR-00012' });
  });

  it('falls back to the default when every format of the type is inactive', () => {
    expect(numberFormatTypeHint(info({ formatCount: 2, format: null })).kind).toBe('default');
  });
});
