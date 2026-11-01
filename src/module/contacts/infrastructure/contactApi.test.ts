import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ContactFormValues } from '@/module/contacts/domain/contact';
import {
  CONTACT_ENDPOINTS,
  createContact,
  fetchContacts,
  fetchPaymentTerms,
  fetchSalesByCustomer,
  getApiErrorMessage,
  updateContact,
} from './contactApi';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/http/apiClient', () => ({ default: http }));
vi.mock('@/module/chart-of-accounts', () => ({ getJournalAccounts: vi.fn() }));

const detail = {
  no: '',
  rt: '',
  rw: '',
  zipCode: '',
  kelurahan: '',
  kecamatan: '',
  city: '',
  province: '',
};

const formValues = (overrides: Partial<ContactFormValues> = {}): ContactFormValues => ({
  displayName: '  PT Maju  ',
  contactType: ['Pelanggan'],
  contactGroups: [],
  fullName: { prefix: ' Bapak ', firstName: 'Budi', middleName: ' ', lastName: '' },
  identity: { type: 'KTP', number: ' 123 ' },
  emails: ['a@x.com', '  ', 'b@x.com'],
  companyName: ' PT ',
  phones: { mobile: ' 0812 ', telephone: '', fax: '' },
  npwp: '',
  addresses: {
    billing: { general: ' Jl. A ', detail: { ...detail, city: 'Bandung' } },
    shipping: { isSameAsBilling: true, general: 'ignored', detail: { ...detail, city: 'Solo' } },
  },
  otherInfo: '',
  bankAccounts: [
    { bankName: 'BCA', branch: '', accountHolder: 'Budi', accountNumber: '123' },
    { bankName: ' ', branch: '', accountHolder: '', accountNumber: '9' },
  ],
  mappingAccount: { arAccount: 'ar-1', apAccount: null, defaultPaymentTerm: 30 },
  ...overrides,
});

beforeEach(() => {
  Object.values(http).forEach((fn) => fn.mockReset());
});

describe('contact payloads (characterization)', () => {
  it('builds the create payload with trimming, nulls and filtered lists', async () => {
    http.post.mockResolvedValue({ data: { data: { id: 'new' } } });

    const created = await createContact(formValues({ external_id: ' ext-1 ' }));

    expect(created.id).toBe('new');
    const [url, payload] = http.post.mock.calls[0];
    expect(url).toBe(CONTACT_ENDPOINTS.contacts);
    expect(payload).toEqual({
      displayName: 'PT Maju',
      contactType: ['Pelanggan'],
      fullName: { prefix: 'Bapak', firstName: 'Budi', middleName: null, lastName: null },
      identity: { type: 'KTP', number: '123' },
      emails: ['a@x.com', 'b@x.com'],
      companyName: 'PT',
      phones: { mobile: '0812', telephone: null, fax: null },
      npwp: null,
      addresses: {
        billing: { general: 'Jl. A', detail: { ...detail, city: 'Bandung' } },
        shipping: {
          isSameAsBilling: true,
          general: 'Jl. A',
          detail: { ...detail, city: 'Bandung' },
        },
      },
      otherInfo: null,
      contactGroups: [],
      bankAccounts: [{ bankName: 'BCA', branch: '', accountHolder: 'Budi', accountNumber: '123' }],
      mappingAccount: { arAccount: 'ar-1', apAccount: null, defaultPaymentTerm: 30 },
      external_id: 'ext-1',
    });
  });

  it('uses the shipping address when it differs and omits external_id on update', async () => {
    http.put.mockResolvedValue({ data: { data: { id: 'c-1' } } });
    const values = formValues({
      external_id: 'ext',
      addresses: {
        billing: { general: 'B', detail },
        shipping: { isSameAsBilling: false, general: ' S ', detail: { ...detail, city: 'Solo' } },
      },
      mappingAccount: { arAccount: null, apAccount: null, defaultPaymentTerm: 0 },
    });

    await updateContact('c-1', values);

    const [url, payload] = http.put.mock.calls[0];
    expect(url).toBe('/v1/contacts/c-1');
    expect(payload.addresses.shipping).toEqual({
      isSameAsBilling: false,
      general: 'S',
      detail: { ...detail, city: 'Solo' },
    });
    expect(payload.mappingAccount.defaultPaymentTerm).toBe(0);
    expect(payload).not.toHaveProperty('external_id');
  });
});

describe('list and transaction fetchers (characterization)', () => {
  it('sends trimmed search and derives pagination fallbacks', async () => {
    http.get.mockResolvedValue({
      data: { data: { data: [{ id: 'a' }, { id: 'b' }], pagination: { pages: 7 } } },
    });

    const result = await fetchContacts({ page: 2, limit: 10, search: '  ab ', contactType: '' });

    expect(http.get).toHaveBeenCalledWith('/v1/contacts', {
      params: { page: 2, limit: 10, search: 'ab', contactType: undefined },
    });
    expect(result.pagination).toEqual({ total: 2, page: 2, limit: 10, totalPages: 7 });
  });

  it('computes total pages from the total when the server sends none', async () => {
    http.get.mockResolvedValue({ data: { data: { data: [], pagination: { total: 25 } } } });
    const result = await fetchContacts({ page: 1, limit: 10 });
    expect(result.pagination.totalPages).toBe(3);
  });

  it('maps customer sales with default paging and ignores the all status', async () => {
    http.get.mockResolvedValue({
      data: { data: { data: [{ id: 's1', transactionNumber: 'INV-1' }], pagination: {} } },
    });

    const result = await fetchSalesByCustomer('c-1', { status: 'all', search: ' x ' });

    expect(http.get).toHaveBeenCalledWith('/v1/sales/customer/c-1', {
      params: { page: 1, limit: 10, search: 'x', status: undefined },
    });
    expect(result.items).toHaveLength(1);
    expect(result.pagination).toEqual({ total: 1, page: 1, limit: 10, totalPages: 1 });
  });

  it('falls back to default payment terms when the endpoint fails or is empty', async () => {
    http.get.mockRejectedValueOnce(new Error('boom'));
    expect((await fetchPaymentTerms()).map((t) => t.id)).toEqual([
      'cod',
      'net15',
      'net30',
      'net60',
    ]);

    http.get.mockResolvedValueOnce({ data: { data: { data: [] } } });
    expect(await fetchPaymentTerms()).toHaveLength(4);

    const terms = [{ id: 't', name: 'T', days: 7, isDefault: false }];
    http.get.mockResolvedValueOnce({ data: { data: { data: terms } } });
    expect(await fetchPaymentTerms()).toEqual(terms);
  });

  it('reads server messages from axios errors only', () => {
    expect(getApiErrorMessage(new Error('x'), 'fallback')).toBe('fallback');
    const axiosError = Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { data: { message: 'Nomor sudah dipakai' } },
    });
    expect(getApiErrorMessage(axiosError, 'fallback')).toBe('Nomor sudah dipakai');
  });
});
