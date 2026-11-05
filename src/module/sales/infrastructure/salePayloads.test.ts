import { describe, expect, it } from 'vitest';
import type { CreateSaleFormValues } from '../domain/sale';
import { buildPaymentFormData, buildSaleFormData } from './salePayloads';

const values = (patch: Partial<CreateSaleFormValues> = {}): CreateSaleFormValues => ({
  customer: 'c-1',
  emails: [],
  transactionDate: '2026-11-05',
  dueDate: '2026-12-05',
  billingAddress: '',
  transactionNumber: '',
  tags: [],
  customerRefNumber: '',
  paymentTerm: '',
  isPriceIncludeTax: false,
  items: [{ productId: 'p-1', description: '', unit: 'Jam', quantity: 2, unitPrice: 50000 }],
  discountType: 'nominal',
  discountValue: 0,
  withholdingType: 'percentage',
  withholdingValue: 0,
  withholdingAccount: '',
  message: '',
  memo: '',
  ...patch,
});

describe('buildSaleFormData', () => {
  it('saves a draft without asking for an email', () => {
    const form = buildSaleFormData(values(), 'draft');
    expect(form.get('status')).toBe('DRAFT');
    expect(form.has('sendEmail')).toBe(false);
  });

  it('sends the invoice and its email together', () => {
    const form = buildSaleFormData(values(), 'send');
    expect(form.get('status')).toBe('SENT');
    expect(form.get('sendEmail')).toBe('true');
  });

  it('never sends a status when updating', () => {
    const form = buildSaleFormData(values(), 'update');
    expect(form.has('status')).toBe(false);
    expect(form.has('sendEmail')).toBe(false);
  });

  it('rounds a nominal discount to the cent', () => {
    const form = buildSaleFormData(
      values({ discountType: 'nominal', discountValue: 1000.005 }),
      'draft'
    );
    expect(form.get('discountValue')).toBe('1000.01');
  });

  it('never sends the unit, which belongs to the product', () => {
    const form = buildSaleFormData(values(), 'draft');
    expect(form.has('items[0][unit]')).toBe(false);
    expect(form.get('items[0][product]')).toBe('p-1');
  });
});

describe('buildPaymentFormData', () => {
  const file = (name: string) => new File(['x'], name, { type: 'text/plain' });

  it('sends one tags[] entry per tag and one attachments entry per file', () => {
    const form = buildPaymentFormData({
      sale: 's-1',
      depositAccount: 'a-1',
      paymentMethod: 'm-1',
      paymentDate: '2026-11-05',
      amount: 100.005,
      tags: ['t-1', 't-2'],
      attachments: [file('a.txt'), file('b.txt'), file('c.txt')],
    });
    expect(form.getAll('tags[]')).toEqual(['t-1', 't-2']);
    expect(form.getAll('attachments')).toHaveLength(3);
    expect(form.get('amount')).toBe('100.01');
  });

  it('omits an empty memo', () => {
    const form = buildPaymentFormData({
      sale: 's-1',
      depositAccount: 'a-1',
      paymentMethod: 'm-1',
      paymentDate: '2026-11-05',
      amount: 1,
      memo: '',
    });
    expect(form.has('memo')).toBe(false);
  });
});
