import { describe, expect, it } from 'vitest';
import type { Contact } from './contact';
import {
  countContactTypes,
  formatContactName,
  formatDate,
  formatPaymentTerm,
  getContactTypeBadgeConfig,
  resolveAccountName,
} from './contactFormat';

const contact = (overrides: Partial<Contact> = {}): Contact => ({
  id: 'c-1',
  contactNumber: 'C-001',
  displayName: 'PT Maju',
  emails: [],
  contactType: [],
  bankAccounts: [],
  deleted: false,
  createdAt: '',
  updatedAt: '',
  ...overrides,
});

describe('contactFormat (characterization)', () => {
  it('formats dates in id-ID short form and falls back to a dash', () => {
    expect(formatDate('2025-03-05T00:00:00.000Z')).toBe('5 Mar 2025');
    expect(formatDate(null)).toBe('—');
    expect(formatDate(undefined)).toBe('—');
    expect(formatDate('')).toBe('—');
    expect(formatDate('not a date')).toBe('—');
  });

  it('joins the filled name parts, otherwise uses the display name', () => {
    expect(
      formatContactName(
        contact({
          fullName: { prefix: 'Bapak', firstName: 'Budi', middleName: null, lastName: 'S' },
        })
      )
    ).toBe('Bapak Budi S');
    expect(formatContactName(contact({ fullName: { prefix: '', firstName: null } }))).toBe(
      'PT Maju'
    );
    expect(formatContactName(contact({ fullName: null }))).toBe('PT Maju');
  });

  it('maps each contact type to its badge color and label', () => {
    expect(getContactTypeBadgeConfig('Pelanggan')).toEqual({ color: 'teal', label: 'Pelanggan' });
    expect(getContactTypeBadgeConfig('Supplier')).toEqual({ color: 'blue', label: 'Supplier' });
    expect(getContactTypeBadgeConfig('Karyawan')).toEqual({ color: 'indigo', label: 'Karyawan' });
    expect(getContactTypeBadgeConfig('Unit')).toEqual({ color: 'cyan', label: 'Unit' });
    expect(getContactTypeBadgeConfig('Lainnya')).toEqual({ color: 'gray', label: 'Lainnya' });
    expect(getContactTypeBadgeConfig('Custom')).toEqual({ color: 'gray', label: 'Custom' });
    expect(getContactTypeBadgeConfig('')).toEqual({ color: 'gray', label: 'Lainnya' });
  });

  it('formats payment terms', () => {
    expect(formatPaymentTerm(null)).toBe('—');
    expect(formatPaymentTerm(undefined)).toBe('—');
    expect(formatPaymentTerm(0)).toBe('Cash on Delivery (COD)');
    expect(formatPaymentTerm(30)).toBe('Net 30 Hari');
  });

  it('resolves account names from ids and objects', () => {
    const map = new Map([['a1', '1-100 · Kas']]);
    expect(resolveAccountName(null, map)).toBe('—');
    expect(resolveAccountName('a1', map)).toBe('1-100 · Kas');
    expect(resolveAccountName('zzz', map)).toBe('zzz');
    expect(resolveAccountName({ name: 'Piutang', accountNumber: '1-200' }, map)).toBe(
      '1-200 · Piutang'
    );
    expect(resolveAccountName({ name: 'Piutang' }, map)).toBe('Piutang');
    expect(resolveAccountName({ id: 'a1' }, map)).toBe('1-100 · Kas');
    expect(resolveAccountName({ id: 'b2' }, map)).toBe('b2');
    expect(resolveAccountName({}, map)).toBe('—');
    expect(resolveAccountName(42, map)).toBe('—');
  });
});

describe('countContactTypes', () => {
  it('counts a multi-type contact once per type', () => {
    expect(
      countContactTypes([
        contact({ contactType: ['Pelanggan', 'Supplier'] }),
        contact({ contactType: ['Unit'] }),
        contact({ contactType: ['Lainnya'] }),
      ])
    ).toEqual({ customers: 1, suppliers: 1, employees: 0, units: 1 });
  });
});
