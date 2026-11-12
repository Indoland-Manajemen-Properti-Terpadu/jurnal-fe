import type { ContactFormValues } from './contact';

/** Keeps digits only; used for every numeric-only contact field, including pasted text. */
export const digitsOnly = (value: string): string => value.replace(/\D/g, '');

const alphanumericOnly = (value: string): string => value.replace(/[^A-Za-z0-9]/g, '');

export const IDENTITY_LENGTH = { KTP: 16, SIMMin: 12, SIMMax: 14, PassportMax: 9 } as const;
export const NPWP_LENGTHS = [15, 16] as const;
export const NPWP_MAX_LENGTH = 16;
export const MOBILE_LENGTH = { min: 9, max: 15 } as const;
export const TELEPHONE_LENGTH = { min: 6, max: 15 } as const;
export const BANK_ACCOUNT_LENGTH = { min: 5, max: 20 } as const;
export const ZIP_CODE_LENGTH = 5;

/** KTP and SIM numbers are digits; a passport number mixes letters and digits. */
export const isPassport = (identityType: string): boolean => identityType === 'Passport';

export const identityMaxLength = (identityType: string): number => {
  if (isPassport(identityType)) return IDENTITY_LENGTH.PassportMax;
  return identityType === 'SIM' ? IDENTITY_LENGTH.SIMMax : IDENTITY_LENGTH.KTP;
};

export const sanitizeIdentityNumber = (value: string, identityType: string): string => {
  if (isPassport(identityType)) return alphanumericOnly(value).toUpperCase();
  return digitsOnly(value);
};

export type ContactInputIssue =
  | 'identityKtp'
  | 'identitySim'
  | 'identityPassport'
  | 'npwp'
  | 'mobile'
  | 'telephone'
  | 'zipCode'
  | 'bankAccountNumber'
  | 'bankNameRequired'
  | 'bankAccountNumberRequired';

const inRange = (value: string, min: number, max: number): boolean =>
  value.length >= min && value.length <= max;

/** Empty is valid: these fields are optional. */
export const validateIdentityNumber = (
  value: string,
  identityType: string
): ContactInputIssue | null => {
  const number = value.trim();
  if (!number) return null;
  if (isPassport(identityType)) {
    return /^[A-Z0-9]{6,9}$/.test(number) ? null : 'identityPassport';
  }
  if (identityType === 'SIM') {
    return /^\d+$/.test(number) && inRange(number, IDENTITY_LENGTH.SIMMin, IDENTITY_LENGTH.SIMMax)
      ? null
      : 'identitySim';
  }
  return /^\d{16}$/.test(number) ? null : 'identityKtp';
};

export const validateNpwp = (value: string): ContactInputIssue | null => {
  const npwp = value.trim();
  if (!npwp) return null;
  return /^\d+$/.test(npwp) && (NPWP_LENGTHS as readonly number[]).includes(npwp.length)
    ? null
    : 'npwp';
};

const validateDigits = (
  value: string,
  range: { min: number; max: number },
  issue: ContactInputIssue
): ContactInputIssue | null => {
  const digits = value.trim();
  if (!digits) return null;
  return /^\d+$/.test(digits) && inRange(digits, range.min, range.max) ? null : issue;
};

export const validateMobile = (value: string) => validateDigits(value, MOBILE_LENGTH, 'mobile');
export const validateTelephone = (value: string) =>
  validateDigits(value, TELEPHONE_LENGTH, 'telephone');

export const validateZipCode = (value: string): ContactInputIssue | null => {
  const zip = value.trim();
  if (!zip) return null;
  return /^\d{5}$/.test(zip) ? null : 'zipCode';
};

export const validateBankAccountNumber = (value: string) =>
  validateDigits(value, BANK_ACCOUNT_LENGTH, 'bankAccountNumber');

/** A bank row is saved only with both a bank name and an account number, so one without the other is an error. */
export const validateBankAccount = (
  bank: ContactFormValues['bankAccounts'][number]
): { bankName: ContactInputIssue | null; accountNumber: ContactInputIssue | null } => {
  const hasName = Boolean(bank.bankName.trim());
  const hasNumber = Boolean(bank.accountNumber.trim());
  return {
    bankName: hasNumber && !hasName ? 'bankNameRequired' : null,
    accountNumber:
      hasName && !hasNumber
        ? 'bankAccountNumberRequired'
        : validateBankAccountNumber(bank.accountNumber),
  };
};

export type ContactFormTab = 'general' | 'address' | 'banks' | 'mapping';

/** The form tab that holds the first field with an error, so a failed submit can show it. */
export const firstTabWithError = (errorPaths: string[]): ContactFormTab | null => {
  const tabOf = (path: string): ContactFormTab => {
    if (path.startsWith('addresses')) return 'address';
    if (path.startsWith('bankAccounts')) return 'banks';
    if (path.startsWith('mappingAccount')) return 'mapping';
    return 'general';
  };
  const order: ContactFormTab[] = ['general', 'address', 'banks', 'mapping'];
  const found = new Set(errorPaths.map(tabOf));
  return order.find((tab) => found.has(tab)) ?? null;
};
