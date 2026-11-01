import { describe, expect, it } from 'vitest';
import type { Contact } from './contact';
import { contactToFormValues, emptyContactForm } from './contactForm';

const contact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'c',
  contactNumber: '',
  displayName: 'PT Maju',
  emails: [],
  contactType: [],
  bankAccounts: [],
  deleted: false,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

describe('contactToFormValues', () => {
  it('matches the empty form for a bare contact except the display name', () => {
    expect(contactToFormValues(contact())).toEqual({
      ...emptyContactForm(),
      displayName: 'PT Maju',
    });
  });

  it('copies saved values and unwraps account references', () => {
    const values = contactToFormValues(
      contact({
        contactType: ['Supplier'],
        emails: ['a@x.com'],
        bankAccounts: [{ bankName: 'BCA', accountHolder: 'Budi', accountNumber: '1' }],
        addresses: { shipping: { isSameAsBilling: false, general: 'S' } },
        mappingAccount: {
          arAccount: { id: 'ar-1' },
          apAccount: 'ap-1',
          defaultPaymentTerm: 0,
          maxReceivable: { isActive: true, amount: 100.5 },
        },
      })
    );

    expect(values.contactType).toEqual(['Supplier']);
    expect(values.emails).toEqual(['a@x.com']);
    expect(values.bankAccounts).toEqual([
      { bankName: 'BCA', branch: '', accountHolder: 'Budi', accountNumber: '1' },
    ]);
    expect(values.addresses.shipping).toMatchObject({ isSameAsBilling: false, general: 'S' });
    expect(values.mappingAccount).toEqual({
      arAccount: 'ar-1',
      apAccount: 'ap-1',
      defaultPaymentTerm: 0,
      maxReceivable: { isActive: true, amount: 100.5 },
      maxPayable: { isActive: false, amount: 0 },
    });
  });
});
