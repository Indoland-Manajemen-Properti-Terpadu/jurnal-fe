import { describe, expect, it } from 'vitest';
import type { CreateSaleFormValues, Sale } from './sale';
import {
  canSaveDraft,
  canSend,
  dueDateFromTerm,
  emptySaleForm,
  saleToFormValues,
  validateStep,
} from './saleForm';

const valid = (patch: Partial<CreateSaleFormValues> = {}): CreateSaleFormValues => ({
  ...emptySaleForm('2026-11-05'),
  customer: 'c-1',
  items: [{ productId: 'p-1', description: '', unit: 'Jam', quantity: 1, unitPrice: 1000 }],
  ...patch,
});

describe('emptySaleForm', () => {
  it('starts today, due today, with one empty line and no price-includes-tax', () => {
    const form = emptySaleForm('2026-11-05');
    expect(form).toMatchObject({
      transactionDate: '2026-11-05',
      dueDate: '2026-11-05',
      isPriceIncludeTax: false,
      customer: '',
    });
    expect(form.items).toHaveLength(1);
  });
});

describe('dueDateFromTerm', () => {
  it('adds the term days to the transaction date', () => {
    expect(dueDateFromTerm('2026-11-05', 30)).toBe('2026-12-05');
    expect(dueDateFromTerm('2026-11-05', 0)).toBe('2026-11-05');
    expect(dueDateFromTerm('2026-01-31', 30)).toBe('2026-03-02');
  });
});

describe('validateStep', () => {
  it('requires a customer on the general step', () => {
    expect(validateStep('general', valid({ customer: '' }))).toHaveProperty('customer');
    expect(validateStep('general', valid())).toEqual({});
  });

  it('rejects a due date before the transaction date', () => {
    const errors = validateStep('general', valid({ dueDate: '2026-11-01' }));
    expect(errors.dueDate).toBe('validation.dueBeforeDate');
  });

  it('rejects an invalid email', () => {
    expect(validateStep('general', valid({ emails: ['bukan-email'] }))).toHaveProperty('emails');
    expect(validateStep('general', valid({ emails: ['a@b.id'] }))).toEqual({});
  });

  it('needs at least one line, and each line a product and a quantity above zero', () => {
    expect(validateStep('lines', valid({ items: [] }))).toHaveProperty('lines');
    const errors = validateStep(
      'lines',
      valid({ items: [{ productId: '', description: '', unit: '', quantity: 0, unitPrice: -1 }] })
    );
    expect(errors).toMatchObject({
      'items.0.productId': 'validation.productRequired',
      'items.0.quantity': 'validation.quantityMin',
      'items.0.unitPrice': 'validation.priceNegative',
    });
  });

  it('refuses a percentage discount or withholding above 100', () => {
    const errors = validateStep(
      'extras',
      valid({
        discountType: 'percentage',
        discountValue: 120,
        withholdingType: 'percentage',
        withholdingValue: 101,
      })
    );
    expect(errors).toHaveProperty('discountValue');
    expect(errors.withholdingValue).toBe('validation.withholdingPercent');
    expect(validateStep('extras', valid())).toEqual({});
  });

  it('does not ask for a withholding account: the server has a default one', () => {
    const errors = validateStep(
      'extras',
      valid({ withholdingType: 'percentage', withholdingValue: 2, withholdingAccount: '' })
    );
    expect(errors).toEqual({});
  });

  it('allows a nominal withholding larger than 100', () => {
    expect(
      validateStep('extras', valid({ withholdingType: 'nominal', withholdingValue: 50000 }))
    ).toEqual({});
  });
});

describe('canSaveDraft and canSend', () => {
  it('allows a draft with a customer and one valid line', () => {
    expect(canSaveDraft(valid())).toBe(true);
    expect(canSaveDraft(valid({ customer: '' }))).toBe(false);
    expect(canSaveDraft(valid({ items: [] }))).toBe(false);
  });

  it('allows sending only when every step is valid', () => {
    expect(canSend(valid())).toBe(true);
    expect(canSend(valid({ dueDate: '2026-11-01' }))).toBe(false);
    expect(canSend(valid({ discountType: 'percentage', discountValue: 120 }))).toBe(false);
  });
});

describe('saleToFormValues', () => {
  it('turns a stored sale back into form values, dates as calendar days', () => {
    const sale = {
      customer: { id: 'c-1', displayName: 'AAG' },
      emails: ['a@b.id'],
      billingAddress: 'Jl. A',
      transactionNumber: 'INV-1',
      transactionDate: '2026-11-04T00:00:00.000Z',
      dueDate: '2026-12-04T00:00:00.000Z',
      tags: [{ id: 't-1', name: 'Tag' }],
      customerRefNumber: 'PO-1',
      paymentTerm: { id: 'pt-1', name: 'Net 30' },
      isPriceIncludeTax: true,
      items: [
        {
          product: { id: 'p-1', name: 'Jasa' },
          description: 'Jasa',
          unit: 'Jam',
          quantity: 2,
          unitPrice: 500,
          tax: { id: 'tx-1', name: 'PPN', rate: 11 },
          amount: 1000,
        },
      ],
      discountType: 'nominal',
      discountValue: 100,
      withholdingType: 'percentage',
      withholdingValue: 2,
      withholdingAccount: { id: 'acc-1', name: 'PPh' },
      message: 'Terima kasih',
      memo: 'Catatan',
    } as unknown as Sale;

    expect(saleToFormValues(sale)).toMatchObject({
      customer: 'c-1',
      transactionDate: '2026-11-04',
      dueDate: '2026-12-04',
      tags: ['t-1'],
      paymentTerm: 'pt-1',
      isPriceIncludeTax: true,
      discountType: 'nominal',
      discountValue: 100,
      withholdingAccount: 'acc-1',
      items: [{ productId: 'p-1', unit: 'Jam', quantity: 2, unitPrice: 500, taxId: 'tx-1' }],
    });
  });
});
