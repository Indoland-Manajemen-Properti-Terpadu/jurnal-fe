import { describe, expect, it } from 'vitest';
import {
  digitsOnly,
  firstTabWithError,
  sanitizeIdentityNumber,
  validateBankAccount,
  validateIdentityNumber,
  validateMobile,
  validateNpwp,
  validateTelephone,
  validateZipCode,
} from './contactInput';

describe('sanitizers', () => {
  it('keeps digits only', () => {
    expect(digitsOnly('08a1-2 3+4')).toBe('081234');
  });

  it('keeps letters for a passport and uppercases them', () => {
    expect(sanitizeIdentityNumber('a-123 4567', 'Passport')).toBe('A1234567');
    expect(sanitizeIdentityNumber('a-123 4567', 'KTP')).toBe('1234567');
  });
});

describe('validateIdentityNumber', () => {
  it.each([
    ['', 'KTP', null],
    ['3174012345678901', 'KTP', null],
    ['317401234567890', 'KTP', 'identityKtp'],
    ['31740123456789AB', 'KTP', 'identityKtp'],
    ['123456789012', 'SIM', null],
    ['12345678901', 'SIM', 'identitySim'],
    ['A1234567', 'Passport', null],
    ['A12', 'Passport', 'identityPassport'],
  ])('%j as %s', (value, type, expected) => {
    expect(validateIdentityNumber(value, type)).toBe(expected);
  });
});

describe('numeric fields', () => {
  it('validates NPWP as 15 or 16 digits', () => {
    expect(validateNpwp('')).toBeNull();
    expect(validateNpwp('012345678901234')).toBeNull();
    expect(validateNpwp('0123456789012345')).toBeNull();
    expect(validateNpwp('01234567890123')).toBe('npwp');
    expect(validateNpwp('01.234.567.8-901.234')).toBe('npwp');
  });

  it('validates phones by length and digits', () => {
    expect(validateMobile('081234567890')).toBeNull();
    expect(validateMobile('0812')).toBe('mobile');
    expect(validateMobile('0812-3456-7890')).toBe('mobile');
    expect(validateTelephone('0215551234')).toBeNull();
    expect(validateTelephone('021')).toBe('telephone');
  });

  it('validates postal code as exactly 5 digits', () => {
    expect(validateZipCode('')).toBeNull();
    expect(validateZipCode('12190')).toBeNull();
    expect(validateZipCode('1219')).toBe('zipCode');
  });
});

describe('validateBankAccount', () => {
  const bank = (bankName: string, accountNumber: string) => ({
    bankName,
    accountNumber,
    branch: '',
    accountHolder: '',
  });

  it('accepts an empty row and a complete row', () => {
    expect(validateBankAccount(bank('', ''))).toEqual({ bankName: null, accountNumber: null });
    expect(validateBankAccount(bank('BCA', '1234567890'))).toEqual({
      bankName: null,
      accountNumber: null,
    });
  });

  it('requires both the bank name and the number', () => {
    expect(validateBankAccount(bank('', '1234567890')).bankName).toBe('bankNameRequired');
    expect(validateBankAccount(bank('BCA', '')).accountNumber).toBe('bankAccountNumberRequired');
    expect(validateBankAccount(bank('BCA', '123')).accountNumber).toBe('bankAccountNumber');
  });
});

describe('firstTabWithError', () => {
  it('picks the earliest tab with an error', () => {
    expect(
      firstTabWithError(['bankAccounts.0.accountNumber', 'addresses.billing.detail.zipCode'])
    ).toBe('address');
    expect(firstTabWithError(['bankAccounts.0.accountNumber', 'phones.mobile'])).toBe('general');
    expect(firstTabWithError([])).toBeNull();
  });
});
