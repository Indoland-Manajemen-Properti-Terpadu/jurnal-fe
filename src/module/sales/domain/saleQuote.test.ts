import { describe, expect, it } from 'vitest';
import { allowedQuoteActions, quoteActions, type SaleQuote } from './saleQuote';
import {
  canSaveQuote,
  emptyQuoteForm,
  quoteToFormValues,
  validateQuoteStep,
} from './saleQuoteForm';

type State = Pick<SaleQuote, 'status' | 'displayStatus' | 'order'>;
const state = (
  status: State['status'],
  displayStatus?: State['displayStatus'],
  order: string | null = null
): State => ({
  status,
  displayStatus: displayStatus ?? status,
  order,
});

describe('quoteActions', () => {
  it('lets a draft be edited, sent and deleted, but not answered', () => {
    expect(quoteActions(state('DRAFT'))).toMatchObject({
      edit: true,
      send: true,
      remove: true,
      accept: false,
      reject: false,
      cancel: false,
      resend: false,
    });
  });

  it('lets a sent quote be answered, revised, resent and cancelled', () => {
    expect(quoteActions(state('SENT'))).toMatchObject({
      accept: true,
      reject: true,
      revise: true,
      resend: true,
      cancel: true,
      edit: false,
    });
  });

  it('keeps an expired quote open only for revising and cancelling', () => {
    const actions = quoteActions(state('SENT', 'EXPIRED'));
    expect(actions).toMatchObject({ revise: true, cancel: true });
    expect(actions).toMatchObject({ accept: false, reject: false, resend: false });
  });

  it('offers an order from an accepted quote, or the order when it exists', () => {
    expect(quoteActions(state('ACCEPTED'))).toMatchObject({
      createOrder: true,
      viewOrder: false,
      resend: true,
    });
    expect(quoteActions(state('ACCEPTED', 'ACCEPTED', 'o-1'))).toMatchObject({
      createOrder: false,
      viewOrder: true,
    });
  });

  it('only allows copying a rejected or cancelled quote', () => {
    for (const status of ['REJECTED', 'VOID'] as const) {
      const actions = quoteActions(state(status));
      expect(actions.duplicate).toBe(true);
      expect(Object.entries(actions).filter(([, on]) => on)).toHaveLength(1);
    }
  });
});

describe('quote form', () => {
  const filled = {
    ...emptyQuoteForm('2026-11-19'),
    customer: 'c-1',
    items: [
      { productId: 'p-1', description: '', unit: '', quantity: 1, unitPrice: 100, taxId: '' },
    ],
  };

  it('opens for two weeks by default', () => {
    expect(emptyQuoteForm('2026-11-19').validUntil).toBe('2026-12-03');
  });

  it('needs a customer, a valid-until day that is not before the date, and usable lines', () => {
    expect(validateQuoteStep('general', emptyQuoteForm('2026-11-19'))).toHaveProperty('customer');
    expect(validateQuoteStep('general', { ...filled, validUntil: '2026-11-01' })).toEqual({
      validUntil: 'validation.validUntilBeforeDate',
    });
    expect(validateQuoteStep('lines', emptyQuoteForm('2026-11-19'))).toHaveProperty(
      'items.0.productId'
    );
    expect(canSaveQuote(filled)).toBe(true);
    expect(canSaveQuote(emptyQuoteForm('2026-11-19'))).toBe(false);
  });

  it('caps a percentage discount at 100 and refuses a negative one', () => {
    expect(validateQuoteStep('extras', { ...filled, discountValue: 120 })).toEqual({
      discountValue: 'validation.discountPercent',
    });
    expect(validateQuoteStep('extras', { ...filled, discountValue: -1 })).toHaveProperty(
      'discountValue'
    );
  });

  it('turns a stored quote back into form values', () => {
    const values = quoteToFormValues({
      id: 'q-1',
      transactionNumber: 'PNW-1',
      transactionDate: '2026-11-19T00:00:00.000Z',
      validUntil: '2026-12-10T00:00:00.000Z',
      customer: { id: 'c-1', displayName: 'X', emails: [] },
      paymentTerm: { id: 'pt-1', name: 'Net 30' },
      unitTower: 'A',
      customerRefNumber: 'PO',
      isPriceIncludeTax: true,
      items: [
        {
          id: 'l-1',
          product: { id: 'p-1', name: 'P' },
          description: 'd',
          quantity: 3,
          unitPrice: 50,
          tax: { id: 't-1', name: 'PPN', rate: 11 },
          taxAmount: 0,
          amount: 150,
          discountAmount: 0,
        },
      ],
      subtotal: 150,
      discountType: 'nominal',
      discountValue: 10,
      discountAmount: 10,
      taxAmount: 0,
      total: 140,
      terms: 't',
      message: 'm',
      memo: 'n',
      createdAt: null,
      updatedAt: null,
      status: 'DRAFT',
      displayStatus: 'DRAFT',
      order: null,
      emails: [],
      sentAt: null,
      acceptedAt: null,
      attachmentCount: 0,
    } as SaleQuote);
    expect(values).toMatchObject({
      customer: 'c-1',
      transactionDate: '2026-11-19',
      validUntil: '2026-12-10',
      paymentTerm: 'pt-1',
      discountType: 'nominal',
    });
    expect(values.items[0]).toMatchObject({ productId: 'p-1', taxId: 't-1', quantity: 3 });
  });
});

describe('allowedQuoteActions', () => {
  const sent = quoteActions({ status: 'SENT', displayStatus: 'SENT', order: null });

  it('keeps everything for a user with every right', () => {
    expect(allowedQuoteActions(sent, { create: true, update: true, delete: true })).toEqual(sent);
  });

  it('drops answering and sending without update, cancelling without delete, copying without create', () => {
    const limited = allowedQuoteActions(sent, { create: false, update: false, delete: false });
    expect(limited).toMatchObject({
      accept: false,
      reject: false,
      revise: false,
      resend: false,
      cancel: false,
      duplicate: false,
    });
  });

  it('lets a user who may only delete cancel a quote', () => {
    const limited = allowedQuoteActions(sent, { create: false, update: false, delete: true });
    expect(limited.cancel).toBe(true);
    expect(limited.accept).toBe(false);
  });
});
