import { describe, expect, it } from 'vitest';
import { allowedOrderActions, orderActions, type SaleOrder } from './saleOrder';
import {
  canSaveOrder,
  emptyOrderForm,
  orderToFormValues,
  validateOrderStep,
} from './saleOrderForm';

const at = (status: SaleOrder['status'], sale: string | null = null) =>
  orderActions({ status, sale });

describe('orderActions email and PDF', () => {
  it('emails again only once the order went to the customer', () => {
    expect(at('DRAFT').resend).toBe(false);
    expect(at('WAITING_CONFIRMATION').resend).toBe(true);
    expect(at('CONFIRMED').resend).toBe(true);
    expect(at('COMPLETED', 's-1').resend).toBe(true);
    expect(at('CANCELLED').resend).toBe(false);
  });

  it('offers the PDF in every status', () => {
    expect(at('DRAFT').pdf).toBe(true);
    expect(at('CANCELLED').pdf).toBe(true);
  });
});

describe('orderActions', () => {
  it('lets a draft be edited, sent, deleted and copied', () => {
    expect(at('DRAFT')).toMatchObject({
      edit: true,
      send: true,
      remove: true,
      confirm: false,
      cancel: false,
    });
  });

  it('lets an order waiting for confirmation be confirmed or cancelled', () => {
    expect(at('WAITING_CONFIRMATION')).toMatchObject({
      confirm: true,
      cancel: true,
      edit: true,
      send: false,
    });
  });

  it('offers the invoice only for a confirmed order', () => {
    expect(at('CONFIRMED')).toMatchObject({ createInvoice: true, cancel: true, edit: true });
    expect(at('WAITING_CONFIRMATION').createInvoice).toBe(false);
  });

  it('shows the invoice of a completed order and nothing else but copying', () => {
    const done = at('COMPLETED', 's-1');
    expect(done).toMatchObject({ viewInvoice: true, duplicate: true });
    expect(done.edit || done.cancel || done.createInvoice).toBe(false);
  });

  it('only allows copying a cancelled order, and its PDF', () => {
    const cancelled = at('CANCELLED');
    expect(Object.entries(cancelled).filter(([, on]) => on)).toEqual([
      ['duplicate', true],
      ['pdf', true],
    ]);
  });
});

describe('allowedOrderActions', () => {
  const rights = {
    create: false,
    update: false,
    delete: false,
    createInvoice: false,
    readInvoice: false,
  };

  it('drops what the rights do not cover', () => {
    const limited = allowedOrderActions(at('CONFIRMED'), rights);
    // The PDF is a read, so it stays; everything that changes the order is gone.
    expect(Object.entries(limited).filter(([, on]) => on)).toEqual([['pdf', true]]);
  });

  it('asks for the invoice rights, not the order rights, to make or see an invoice', () => {
    expect(
      allowedOrderActions(at('CONFIRMED'), { ...rights, createInvoice: true }).createInvoice
    ).toBe(true);
    expect(
      allowedOrderActions(at('COMPLETED', 's-1'), { ...rights, readInvoice: true }).viewInvoice
    ).toBe(true);
  });
});

describe('order form', () => {
  const filled = {
    ...emptyOrderForm('2026-11-19'),
    customer: 'c-1',
    items: [
      { productId: 'p-1', description: '', unit: '', quantity: 1, unitPrice: 100, taxId: '' },
    ],
  };

  it('is due a month after the order by default', () => {
    expect(emptyOrderForm('2026-11-19').targetDate).toBe('2026-12-19');
  });

  it('needs a target date that is not before the order date', () => {
    expect(validateOrderStep('general', { ...filled, targetDate: '' })).toEqual({
      targetDate: 'validation.targetDateRequired',
    });
    expect(validateOrderStep('general', { ...filled, targetDate: '2026-11-01' })).toEqual({
      targetDate: 'validation.targetBeforeDate',
    });
    expect(canSaveOrder(filled)).toBe(true);
    expect(canSaveOrder(emptyOrderForm('2026-11-19'))).toBe(false);
  });

  it('turns a stored order back into form values', () => {
    const values = orderToFormValues({
      id: 'o-1',
      transactionNumber: 'SO-1',
      transactionDate: '2026-11-19T00:00:00.000Z',
      targetDate: '2026-12-20T00:00:00.000Z',
      deliveryAddress: 'Jl. A',
      customer: { id: 'c-1', displayName: 'X', emails: [] },
      paymentTerm: null,
      unitTower: '',
      customerRefNumber: '',
      isPriceIncludeTax: false,
      items: [],
      subtotal: 0,
      discountType: null,
      discountValue: 0,
      discountAmount: 0,
      taxAmount: 0,
      total: 0,
      terms: '',
      message: '',
      memo: '',
      createdAt: null,
      updatedAt: null,
      status: 'DRAFT',
      quote: null,
      quoteNumber: null,
      sale: null,
      saleNumber: null,
      emails: [],
      sentAt: null,
      confirmedAt: null,
    });
    expect(values).toMatchObject({
      customer: 'c-1',
      transactionDate: '2026-11-19',
      targetDate: '2026-12-20',
      deliveryAddress: 'Jl. A',
      discountType: 'percentage',
    });
  });
});
