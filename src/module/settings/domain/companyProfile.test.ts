import { describe, expect, it } from 'vitest';
import {
  addressLine,
  checkLogoFile,
  companyInitials,
  COMPANY_LIMITS,
  hasCompanyErrors,
  isCompanyFormChanged,
  taxPhoneLine,
  toCompanyBody,
  validateCompanyForm,
  type CompanyForm,
} from './companyProfile';

const form = (overrides: Partial<CompanyForm> = {}): CompanyForm => ({
  name: 'PT Indoland Manajemen Properti Terpadu',
  address: 'Jl. Jenderal Sudirman Kav. 52-53',
  city: 'Jakarta',
  postalCode: '12190',
  npwp: '01.234.567.8-012.000',
  phone: '(021) 5150000',
  email: 'finance@perusahaan.co.id',
  website: 'www.perusahaan.co.id',
  ...overrides,
});

describe('validateCompanyForm', () => {
  it('accepts a complete profile', () => {
    expect(hasCompanyErrors(validateCompanyForm(form()))).toBe(false);
  });

  it('accepts a profile with only a name, since every other line is optional', () => {
    const only = form({
      address: '',
      city: '',
      postalCode: '',
      npwp: '',
      phone: '',
      email: '',
      website: '',
    });
    expect(hasCompanyErrors(validateCompanyForm(only))).toBe(false);
  });

  it('needs a company name, and a name of only spaces does not count', () => {
    expect(validateCompanyForm(form({ name: '' })).name).toBe('required');
    expect(validateCompanyForm(form({ name: '   ' })).name).toBe('required');
  });

  it('refuses an email that is not an email, but accepts a blank one', () => {
    expect(validateCompanyForm(form({ email: 'bukan-email' })).email).toBe('invalidEmail');
    expect(validateCompanyForm(form({ email: 'a@b' })).email).toBe('invalidEmail');
    expect(validateCompanyForm(form({ email: '' })).email).toBeUndefined();
  });

  it('keeps every text within what the service takes', () => {
    const tooLong = form({
      name: 'x'.repeat(COMPANY_LIMITS.name + 1),
      postalCode: '1'.repeat(COMPANY_LIMITS.postalCode + 1),
    });
    const errors = validateCompanyForm(tooLong);

    expect(errors.name).toBe('tooLong');
    expect(errors.postalCode).toBe('tooLong');
    expect(
      validateCompanyForm(form({ name: 'x'.repeat(COMPANY_LIMITS.name) })).name
    ).toBeUndefined();
  });
});

describe('isCompanyFormChanged and toCompanyBody', () => {
  it('sees a real change but not spaces around the text', () => {
    expect(isCompanyFormChanged(form({ city: ' Jakarta ' }), form())).toBe(false);
    expect(isCompanyFormChanged(form({ city: 'Bandung' }), form())).toBe(true);
  });

  it('sends every field trimmed, so a cleared field is really cleared', () => {
    const body = toCompanyBody(form({ name: '  PT Alfa ', website: '   ' }));

    expect(body.name).toBe('PT Alfa');
    expect(body.website).toBe('');
    expect(Object.keys(body)).toHaveLength(8);
  });
});

describe('checkLogoFile', () => {
  it('takes PNG, JPG and WEBP up to 1 MB', () => {
    expect(checkLogoFile({ type: 'image/png', size: 1024 * 1024 })).toBeNull();
    expect(checkLogoFile({ type: 'image/jpeg', size: 10 })).toBeNull();
    expect(checkLogoFile({ type: 'image/webp', size: 10 })).toBeNull();
  });

  it('refuses SVG and documents by type, and a big picture by size', () => {
    expect(checkLogoFile({ type: 'image/svg+xml', size: 10 })).toBe('type');
    expect(checkLogoFile({ type: 'application/pdf', size: 10 })).toBe('type');
    expect(checkLogoFile({ type: 'image/png', size: 1024 * 1024 + 1 })).toBe('size');
  });
});

describe('what the document header prints', () => {
  it('writes the address line as "alamat, kota kode pos"', () => {
    expect(addressLine(form())).toBe('Jl. Jenderal Sudirman Kav. 52-53, Jakarta 12190');
  });

  it('leaves out the parts that are blank', () => {
    expect(addressLine(form({ address: '', postalCode: '' }))).toBe('Jakarta');
    expect(addressLine(form({ address: '', city: '', postalCode: '' }))).toBe('');
    expect(addressLine(form({ city: '' }))).toBe('Jl. Jenderal Sudirman Kav. 52-53, 12190');
  });

  it('writes the tax and phone line with the labels it is given', () => {
    const labels = { npwp: 'NPWP', phone: 'Telp' };
    expect(taxPhoneLine(form(), labels)).toBe('NPWP 01.234.567.8-012.000 - Telp (021) 5150000');
    expect(taxPhoneLine(form({ phone: '' }), labels)).toBe('NPWP 01.234.567.8-012.000');
    expect(taxPhoneLine(form({ npwp: '', phone: '' }), labels)).toBe('');
  });

  it('makes the letters of the box printed without a logo', () => {
    expect(companyInitials('PT Indoland Manajemen')).toBe('PI');
    expect(companyInitials('Demo Site')).toBe('DS');
    expect(companyInitials('Proapps')).toBe('PR');
    expect(companyInitials('   ')).toBe('?');
  });
});
