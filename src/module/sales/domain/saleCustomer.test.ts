import { describe, expect, it } from 'vitest';
import type { Sale } from './sale';
import { withContactDetails } from './saleCustomer';

const sale = (customer: Partial<NonNullable<Sale['customer']>> | null, extra = {}) =>
  ({
    emails: [],
    billingAddress: '',
    customer: customer && { id: 'c1', displayName: 'QA', ...customer },
    ...extra,
  }) as unknown as Sale;

const contact = { emails: ['qa@example.com'], billingAddress: 'Jl. Uji 1' };

describe('withContactDetails', () => {
  it('fills the email and address the invoice response left out', () => {
    const next = withContactDetails(sale({}), contact);
    expect(next.customer?.emails).toEqual(['qa@example.com']);
    expect(next.customer?.billingAddress).toBe('Jl. Uji 1');
  });

  it('keeps what the invoice already carries', () => {
    const next = withContactDetails(
      sale({ emails: ['own@example.com'], billingAddress: 'Jl. Sendiri' }),
      contact
    );
    expect(next.customer?.emails).toEqual(['own@example.com']);
    expect(next.customer?.billingAddress).toBe('Jl. Sendiri');
  });

  it('leaves an invoice without a customer alone', () => {
    const base = sale(null);
    expect(withContactDetails(base, contact)).toBe(base);
  });
});
