import { describe, expect, it } from 'vitest';
import { mapContact, mapPagination } from './contactMapper';

describe('mapContact (characterization)', () => {
  it('maps snake_case fallbacks and defaults', () => {
    const contact = mapContact({
      _id: 'c-9',
      contact_number: 'C-9',
      company_name: 'PT',
      other_info: 'note',
      created_at: 'c',
      updated_at: 'u',
      externalId: 'ext',
      mappingAccount: { defaultPaymentTerm: 14, maxReceivable: { isActive: true, amount: 5000.5 } },
    });

    expect(contact).toMatchObject({
      id: 'c-9',
      contactNumber: 'C-9',
      displayName: 'Tanpa Nama',
      companyName: 'PT',
      otherInfo: 'note',
      createdAt: 'c',
      updatedAt: 'u',
      external_id: 'ext',
      emails: [],
      contactType: [],
      contactGroups: [],
      bankAccounts: [],
      deleted: false,
      fullName: null,
      npwp: null,
    });
    expect(contact.mappingAccount).toEqual({
      arAccount: null,
      apAccount: null,
      defaultPaymentTerm: 14,
      maxReceivable: { isActive: true, amount: 5000.5 },
      maxPayable: undefined,
    });
  });

  it('keeps a non-numeric payment term as null and coerces deleted', () => {
    const contact = mapContact({
      id: 'c',
      displayName: 'X',
      deleted: 1,
      mappingAccount: { defaultPaymentTerm: '30' },
    });
    expect(contact.deleted).toBe(true);
    expect(contact.mappingAccount?.defaultPaymentTerm).toBeNull();
  });
});

describe('credit limit money', () => {
  it('rounds limits half up to the cent and keeps whole rupiah', () => {
    const contact = mapContact({
      id: 'c',
      mappingAccount: {
        maxReceivable: { isActive: true, amount: 1000.005 },
        maxPayable: { isActive: false, amount: 2500000 },
      },
    });

    expect(contact.mappingAccount?.maxReceivable).toEqual({ isActive: true, amount: 1000.01 });
    expect(contact.mappingAccount?.maxPayable).toEqual({ isActive: false, amount: 2500000 });
  });

  it('treats a non-number limit amount as 0', () => {
    const contact = mapContact({ id: 'c', mappingAccount: { maxPayable: { amount: '5' } } });
    expect(contact.mappingAccount?.maxPayable).toEqual({ isActive: false, amount: 0 });
  });
});

describe('mapPagination', () => {
  it('prefers server values, then pages, then a computed page count', () => {
    expect(
      mapPagination({ total: 5, page: 2, limit: 5, totalPages: 9 }, 5, { page: 1, limit: 10 })
    ).toEqual({
      total: 5,
      page: 2,
      limit: 5,
      totalPages: 9,
    });
    expect(mapPagination({ pages: 4 }, 2, { page: 3, limit: 10 })).toEqual({
      total: 2,
      page: 3,
      limit: 10,
      totalPages: 4,
    });
    expect(mapPagination(undefined, 0, { page: 1, limit: 10 }).totalPages).toBe(1);
  });
});
