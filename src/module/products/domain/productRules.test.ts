import type { AccountOption, Product } from './product';
import {
  buildAccountLabelMap,
  buildTaxLabelMap,
  filterAccountsByNormalBalance,
  requiredWhen,
  resolveAccountLabel,
  resolveTaxLabel,
  summarizeProducts,
  toInitialValues,
} from './productRules';

const accounts = buildAccountLabelMap([{ id: 'a1', label: '1-100 · Kas', isDebit: true }]);
const taxes = buildTaxLabelMap([{ id: 't1', name: 'PPN', rate: 11 }]);

describe('toInitialValues', () => {
  it('starts a new product as bought and sold, not stock tracked', () => {
    const values = toInitialValues();
    expect(values.name).toBe('');
    expect(values.productCategory).toBeNull();
    expect(values.buyingInfo.isPurchased).toBe(true);
    expect(values.sellingInfo.isSold).toBe(true);
    expect(values.inventoryInfo).toEqual({ isTracked: false, inventoryAccount: null, minStock: 0 });
  });

  it('copies an existing product and never prefills the image', () => {
    const product = {
      name: 'Listrik',
      sku: 'S1',
      category: { id: 'c1', name: 'U' },
      buyingInfo: { isPurchased: false, unitPrice: 12.5, purchaseAccount: null, purchaseTax: null },
      sellingInfo: {
        isSold: false,
        unitPrice: null,
        salesAccount: null,
        accountReceivable: null,
        salesTax: null,
      },
      inventoryInfo: { isTracked: true, inventoryAccount: 'a1', minStock: 3 },
    } as Product;
    const values = toInitialValues(product);
    expect(values).toMatchObject({
      name: 'Listrik',
      sku: 'S1',
      productCategory: 'c1',
      image: null,
    });
    expect(values.buyingInfo.unitPrice).toBe(12.5);
    expect(values.inventoryInfo.minStock).toBe(3);
  });
});

describe('requiredWhen', () => {
  it('reports the message only for an enabled, empty field', () => {
    expect(requiredWhen(true, null, 'msg')).toBe('msg');
    expect(requiredWhen(true, '', 'msg')).toBe('msg');
    expect(requiredWhen(true, 0, 'msg')).toBeNull();
    expect(requiredWhen(true, 1500.5, 'msg')).toBeNull();
    expect(requiredWhen(false, null, 'msg')).toBeNull();
  });
});

describe('resolveAccountLabel', () => {
  it('returns null when no account is set', () => {
    expect(resolveAccountLabel(null, accounts)).toBeNull();
    expect(resolveAccountLabel('', accounts)).toBeNull();
    expect(resolveAccountLabel({}, accounts)).toBeNull();
  });

  it('looks an id up and falls back to the raw id', () => {
    expect(resolveAccountLabel('a1', accounts)).toBe('1-100 · Kas');
    expect(resolveAccountLabel('zzz', accounts)).toBe('zzz');
  });

  it('prefers an embedded account name and number', () => {
    expect(resolveAccountLabel({ name: 'Kas', accountNumber: '1-100' }, accounts)).toBe(
      '1-100 · Kas'
    );
    expect(resolveAccountLabel({ name: 'Kas' }, accounts)).toBe('Kas');
    expect(resolveAccountLabel({ id: 'a1' }, accounts)).toBe('1-100 · Kas');
  });
});

describe('resolveTaxLabel', () => {
  it('returns null when no tax is set', () => {
    expect(resolveTaxLabel(null, taxes)).toBeNull();
    expect(resolveTaxLabel({}, taxes)).toBeNull();
  });

  it('formats tax names with their rate', () => {
    expect(taxes.get('t1')).toBe('PPN (11%)');
    expect(resolveTaxLabel('t1', taxes)).toBe('PPN (11%)');
    expect(resolveTaxLabel('unknown', taxes)).toBe('unknown');
    expect(resolveTaxLabel({ name: 'PPh', rate: 2.5 }, taxes)).toBe('PPh (2.5%)');
    expect(resolveTaxLabel({ name: 'PPh' }, taxes)).toBe('PPh (0%)');
    expect(resolveTaxLabel({ id: 't1' }, taxes)).toBe('PPN (11%)');
  });
});

describe('filterAccountsByNormalBalance', () => {
  const list: AccountOption[] = [
    { id: 'rev', label: 'Pendapatan', isDebit: false },
    { id: 'ar', label: 'Piutang', isDebit: true },
    { id: 'x', label: 'Tanpa kategori', isDebit: null },
  ];

  it('offers credit accounts for sales and debit accounts for receivables', () => {
    expect(filterAccountsByNormalBalance(list, 'credit').map((a) => a.id)).toEqual(['rev']);
    expect(filterAccountsByNormalBalance(list, 'debit').map((a) => a.id)).toEqual(['ar']);
  });

  it('keeps the account a product already uses selectable', () => {
    expect(filterAccountsByNormalBalance(list, 'credit', 'ar').map((a) => a.id)).toEqual([
      'rev',
      'ar',
    ]);
  });
});

describe('summarizeProducts', () => {
  const make = (sold: boolean, bought: boolean, tracked: boolean, category = 'c1') =>
    ({
      category: { id: category, name: category },
      sellingInfo: { isSold: sold },
      buyingInfo: { isPurchased: bought },
      inventoryInfo: { isTracked: tracked },
    }) as Product;

  it('counts sold, bought and tracked products against the given total', () => {
    const items = [
      make(true, false, false),
      make(true, true, true),
      make(false, true, false, 'c2'),
    ];
    expect(summarizeProducts(items, 20)).toEqual({
      total: 20,
      sold: 2,
      bought: 2,
      tracked: 1,
      categoryCounts: [2, 1],
    });
  });
});
