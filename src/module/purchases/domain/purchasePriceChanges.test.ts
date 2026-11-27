import {
  buildPriceChangeInput,
  compareInvoiceTotal,
  openPriceChangeItems,
  validatePriceChangeForm,
  type PriceChangeFormValues,
} from '@/module/purchases/domain/purchasePriceChanges';

const items = [
  {
    id: 'item-1',
    description: 'Meja rapat',
    quantity: 10,
    billedQty: 2,
    unitPrice: 1_000,
  },
  {
    id: 'item-2',
    description: 'Kursi',
    quantity: 4,
    billedQty: 4,
    unitPrice: 250,
  },
  {
    id: 'item-1',
    description: 'Meja rapat',
    quantity: 10,
    billedQty: 2,
    unitPrice: 1_000,
  },
];

const values: PriceChangeFormValues = {
  proposedPrices: { 'item-1': 1_250, 'item-2': 300 },
  reason: ' Harga invoice vendor berbeda ',
  vendorInvoiceNumber: ' INV-01 ',
  vendorInvoiceTotal: 2_500,
};

describe('price change requests', () => {
  it('lists each still-open order item once and excludes fully billed items', () => {
    expect(openPriceChangeItems(items)).toEqual([
      {
        purchaseOrderItem: 'item-1',
        description: 'Meja rapat',
        openQty: 8,
        oldUnitPrice: 1_000,
      },
    ]);
  });

  it('submits only changed open item prices and trims the approval context', () => {
    expect(buildPriceChangeInput(items, values)).toEqual({
      items: [{ purchaseOrderItem: 'item-1', newUnitPrice: 1_250 }],
      reason: 'Harga invoice vendor berbeda',
      vendorInvoiceNumber: 'INV-01',
      vendorInvoiceTotal: 2_500,
    });
  });

  it('allows a zero unit price but rejects a negative or non-finite price', () => {
    expect(
      validatePriceChangeForm(
        { ...values, proposedPrices: { 'item-1': 0 } },
        openPriceChangeItems(items)
      )
    ).toEqual({});
    expect(
      validatePriceChangeForm(
        { ...values, proposedPrices: { 'item-1': -1 } },
        openPriceChangeItems(items)
      ).itemPrices
    ).toBe('invalid');
  });

  it('requires a reason, an invoice total, and one changed open item', () => {
    expect(
      validatePriceChangeForm(
        { ...values, reason: '   ', vendorInvoiceTotal: '' },
        openPriceChangeItems(items)
      )
    ).toEqual({ reason: 'required', vendorInvoiceTotal: 'required' });
    expect(
      validatePriceChangeForm(
        { ...values, proposedPrices: { 'item-1': 1_000 } },
        openPriceChangeItems(items)
      ).items
    ).toBe('noChanges');
  });

  it('compares invoice totals at the preview precision from zero to four digits', () => {
    expect(compareInvoiceTotal(1_000, 1_000.4, 0)).toBe(true);
    expect(compareInvoiceTotal(1_000, 1_000.01, 2)).toBe(false);
    expect(compareInvoiceTotal(1_000.1234, 1_000.12339, 4)).toBe(true);
    expect(compareInvoiceTotal('', 1_000, 2)).toBeNull();
  });

  it('rounds decimal tie values by the server precision without binary float drift', () => {
    expect(compareInvoiceTotal(1.005, 1.01, 2)).toBe(true);
  });
});
