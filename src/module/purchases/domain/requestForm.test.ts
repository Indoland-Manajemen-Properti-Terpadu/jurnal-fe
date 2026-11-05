import {
  emptyRequestForm,
  hasRequestErrors,
  toRequestInput,
  validateRequestForm,
} from '@/module/purchases/domain/requestForm';
import { lowestQuotationId } from '@/module/purchases/domain/quotationForm';
import type { Quotation } from '@/module/purchases/domain/purchaseDocuments';

const party = { id: 'v', name: 'V', paymentTermDays: null, npwp: null };

describe('request form', () => {
  it('requires a description when no product is picked and a positive quantity', () => {
    const form = emptyRequestForm('2026-11-05');
    form.items[0].quantity = 0;
    const errors = validateRequestForm(form);
    expect(errors.itemRows[form.items[0].key]).toEqual({
      description: 'required',
      quantity: 'positive',
    });
    expect(hasRequestErrors(errors)).toBe(true);
  });

  it('accepts a product line without a description', () => {
    const form = emptyRequestForm('2026-11-05');
    form.items[0].productId = 'p1';
    expect(hasRequestErrors(validateRequestForm(form))).toBe(false);
  });

  it('rejects a required date before the request date', () => {
    const form = emptyRequestForm('2026-11-05');
    form.items[0].description = 'Jasa';
    form.requiredDate = '2026-11-01';
    expect(validateRequestForm(form).requiredDate).toBe('beforeDate');
  });

  it('sends only product, description and quantity per item, and leaves empty fields out', () => {
    const form = emptyRequestForm('2026-11-05');
    form.mode = 'WITH_QUOTATION';
    form.items[0] = { ...form.items[0], productId: 'p1', description: ' Kertas ', quantity: 3 };
    expect(toRequestInput(form)).toEqual({
      transactionDate: '2026-11-05',
      requiredDate: undefined,
      department: undefined,
      purpose: undefined,
      procurementMode: 'WITH_QUOTATION',
      memo: undefined,
      items: [{ product: 'p1', description: 'Kertas', quantity: 3 }],
    });
  });
});

describe('lowestQuotationId', () => {
  const quote = (id: string, total: number): Quotation => ({
    id,
    vendor: party,
    number: '',
    date: '2026-11-05',
    validUntil: null,
    items: [],
    total,
    notes: '',
  });

  it('picks the cheapest only when there is a clear winner', () => {
    expect(lowestQuotationId([quote('a', 10), quote('b', 8)])).toBe('b');
    expect(lowestQuotationId([quote('a', 8), quote('b', 8)])).toBeNull();
    expect(lowestQuotationId([quote('a', 8)])).toBeNull();
  });
});
