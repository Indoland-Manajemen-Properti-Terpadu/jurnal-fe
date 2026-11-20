import { describe, expect, it } from 'vitest';
import type { SaleOrder } from './saleOrder';
import { orderToSaleFormValues } from './saleOrderInvoice';

const order = {
  id: 'o-1',
  customer: { id: 'c-1', displayName: 'X', emails: [] },
  customerRefNumber: 'PO-1',
  paymentTerm: { id: 'pt-1', name: 'Net 30', days: 30 },
  isPriceIncludeTax: true,
  items: [
    {
      id: 'l-1',
      product: { id: 'p-1', name: 'P' },
      description: 'Jasa',
      quantity: 2,
      unitPrice: 1000,
      tax: { id: 't-1', name: 'PPN', rate: 11 },
      taxAmount: 0,
      amount: 2000,
      discountAmount: 0,
    },
    {
      id: 'l-2',
      product: null,
      description: 'Tanpa produk',
      quantity: 1,
      unitPrice: 50,
      tax: null,
      taxAmount: 0,
      amount: 50,
      discountAmount: 0,
    },
  ],
  discountType: 'percentage',
  discountValue: 10,
  message: 'Halo',
  memo: 'Catatan',
} as unknown as SaleOrder;

describe('orderToSaleFormValues', () => {
  const values = orderToSaleFormValues(order, '2026-11-19');

  it('links the order and keeps its customer, lines and discount', () => {
    expect(values.saleOrder).toBe('o-1');
    expect(values.customer).toBe('c-1');
    expect(values.isPriceIncludeTax).toBe(true);
    expect(values.discountType).toBe('percentage');
    expect(values.discountValue).toBe(10);
    expect(values.items[0]).toMatchObject({
      productId: 'p-1',
      quantity: 2,
      unitPrice: 1000,
      taxId: 't-1',
    });
  });

  it('dates the invoice today and counts the term from there', () => {
    expect(values.transactionDate).toBe('2026-11-19');
    expect(values.paymentTerm).toBe('pt-1');
    expect(values.dueDate).toBe('2026-12-19');
  });

  it('leaves a line without a product empty so the form asks for one', () => {
    expect(values.items[1].productId).toBe('');
  });

  it('is due today when the order has no term', () => {
    const noTerm = orderToSaleFormValues({ ...order, paymentTerm: null }, '2026-11-19');
    expect(noTerm.dueDate).toBe('2026-11-19');
    expect(noTerm.paymentTerm).toBe('');
  });
});

describe('orderToSaleFormValues for a partly invoiced order', () => {
  const partly = {
    ...order,
    items: [
      { ...order.items[0], quantity: 4, invoicedQty: 1, remainingQty: 3 },
      { ...order.items[1], quantity: 1, invoicedQty: 1, remainingQty: 0 },
    ],
  } as unknown as SaleOrder;
  const values = orderToSaleFormValues(partly, '2026-11-19');

  it('bills what is left of each line and skips a line that is fully invoiced', () => {
    expect(values.items).toHaveLength(1);
    expect(values.items[0]).toMatchObject({ quantity: 3, saleOrderItem: 'l-1', maxQuantity: 3 });
  });

  it('keeps the whole quantity for an order that has no invoice yet', () => {
    const fresh = orderToSaleFormValues(order, '2026-11-19');
    expect(fresh.items[0]).toMatchObject({ quantity: 2, saleOrderItem: 'l-1' });
    expect(fresh.items[0].maxQuantity).toBeUndefined();
  });

  it('shrinks a nominal discount to the share that is billed', () => {
    const nominal = {
      ...partly,
      discountType: 'nominal',
      discountValue: 400,
      items: [{ ...partly.items[0], quantity: 4, unitPrice: 1000, remainingQty: 1 }],
    } as unknown as SaleOrder;
    expect(orderToSaleFormValues(nominal, '2026-11-19').discountValue).toBe(100);
  });

  it('leaves a percentage discount as it is', () => {
    expect(values.discountValue).toBe(10);
  });
});
