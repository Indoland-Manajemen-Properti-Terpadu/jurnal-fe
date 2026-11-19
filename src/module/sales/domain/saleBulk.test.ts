import { describe, expect, it } from 'vitest';
import { BULK_MAX_CUSTOMERS, emptyBulkForm, validateBulk } from './saleBulk';

const valid = {
  ...emptyBulkForm('2026-11-19'),
  product: 'p1',
  dueDate: '2026-12-19',
  unitPrice: 300000,
  customers: ['c1'],
};

describe('validateBulk', () => {
  it('starts on the current month and accepts a complete form', () => {
    expect(emptyBulkForm('2026-11-19').period).toBe('2026-11');
    expect(validateBulk(valid)).toEqual({});
  });

  it('asks for a product, a customer and a real month', () => {
    const errors = validateBulk({ ...valid, product: '', customers: [], period: '2026-13' });
    expect(Object.keys(errors).sort()).toEqual(['customers', 'period', 'product']);
  });

  it('refuses a due date before the invoice date and a negative price', () => {
    const errors = validateBulk({ ...valid, dueDate: '2026-11-01', unitPrice: -1 });
    expect(errors.dueDate).toBe('validation.dueBeforeDate');
    expect(errors.unitPrice).toBe('validation.priceNegative');
  });

  it('allows 200 customers and refuses 201', () => {
    const many = (n: number) => Array.from({ length: n }, (_, i) => `c${i}`);
    expect(
      validateBulk({ ...valid, customers: many(BULK_MAX_CUSTOMERS) }).customers
    ).toBeUndefined();
    expect(validateBulk({ ...valid, customers: many(BULK_MAX_CUSTOMERS + 1) }).customers).toBe(
      'validation.customersTooMany'
    );
  });
});
