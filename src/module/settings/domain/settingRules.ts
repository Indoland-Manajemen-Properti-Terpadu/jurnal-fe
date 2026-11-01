import type { CreateTaxPayload } from './settingTypes';

/** Validators return a key of the `settings` namespace (`validation.*`), or null when the value is valid. */
export type SettingValidationKey =
  | 'validation.taxNameRequired'
  | 'validation.taxRateMin'
  | 'validation.paymentTermNameRequired'
  | 'validation.paymentTermDaysMin'
  | 'validation.paymentMethodNameRequired'
  | 'validation.adminFeeMin'
  | 'validation.feeAccountRequired'
  | 'validation.tagNameRequired'
  | 'validation.prefixRequired'
  | 'validation.startNumberMin';

/** Indonesian VAT (PPN) rate the tax form starts with. */
export const DEFAULT_TAX_RATE = 11;

const required = (value: string, key: SettingValidationKey): SettingValidationKey | null =>
  value.trim() ? null : key;

const atLeast = (
  value: number | undefined,
  min: number,
  key: SettingValidationKey
): SettingValidationKey | null => (value === undefined || value < min ? key : null);

export const validateTaxName = (value: string) => required(value, 'validation.taxNameRequired');
export const validateTaxRate = (value: number | undefined) =>
  atLeast(value, 0, 'validation.taxRateMin');
export const validatePaymentTermName = (value: string) =>
  required(value, 'validation.paymentTermNameRequired');
export const validatePaymentTermDays = (value: number | undefined) =>
  atLeast(value, 0, 'validation.paymentTermDaysMin');
export const validatePaymentMethodName = (value: string) =>
  required(value, 'validation.paymentMethodNameRequired');
export const validateAdminFee = (value: number | undefined) =>
  atLeast(value, 0, 'validation.adminFeeMin');
export const validateTagName = (value: string) => required(value, 'validation.tagNameRequired');
export const validateNumberFormatPrefix = (value: string) =>
  required(value, 'validation.prefixRequired');
export const validateStartNumber = (value: number | undefined) =>
  atLeast(value, 1, 'validation.startNumberMin');

/** Accounting rule: an admin fee needs an expense account so the journal knows where to debit it. */
export const validateFeeAccount = (
  adminFee: number | undefined,
  feeAccount: string | null | undefined
): SettingValidationKey | null =>
  adminFee && adminFee > 0 && !feeAccount ? 'validation.feeAccountRequired' : null;

/** Document number preview: prefix and suffix joined with a slash, number padded to six digits. */
export const previewNumber = (prefix: string, num: number, suffix: string): string =>
  `${prefix ? `${prefix}/` : ''}${String(num).padStart(6, '0')}${suffix ? `/${suffix}` : ''}`;

export interface TaxFormValues {
  name: string;
  rate: number;
  salesAccount: string;
  purchaseAccount: string;
}

/** A tax payload: an unchosen account is sent as undefined, never as an empty string. */
export const buildTaxPayload = (values: TaxFormValues): CreateTaxPayload => ({
  name: values.name,
  rate: values.rate,
  salesAccount: values.salesAccount || undefined,
  purchaseAccount: values.purchaseAccount || undefined,
});
