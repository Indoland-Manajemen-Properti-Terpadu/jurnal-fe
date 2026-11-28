import type { NegativeNumberFormat } from '@/module/settings/domain/settingTypes';

/** Decimal places the site shows money with (general settings `decimalPrecision`). */
export const DEFAULT_DECIMAL_PRECISION = 2;
export const DEFAULT_NEGATIVE_NUMBER_FORMAT: NegativeNumberFormat = 'parentheses';
const ALLOWED_PRECISIONS = [0, 2, 3, 4];

/** Falls back to 2 for a value the setting cannot hold (missing, not yet loaded, out of range). */
export const toDecimalPrecision = (value: unknown): number =>
  typeof value === 'number' && ALLOWED_PRECISIONS.includes(value)
    ? value
    : DEFAULT_DECIMAL_PRECISION;

const formatters = new Map<string, Intl.NumberFormat>();
const formatter = (precision: number, currency: boolean): Intl.NumberFormat => {
  const digits = toDecimalPrecision(precision);
  const key = `${digits}${currency ? 'c' : 'n'}`;
  let found = formatters.get(key);
  if (!found) {
    found = new Intl.NumberFormat('id-ID', {
      ...(currency ? { style: 'currency', currency: 'IDR' } : {}),
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formatters.set(key, found);
  }
  return found;
};

/** `Rp 6.641.802.026,00`: always shows every digit of `precision`, never drops trailing zeros. */
export const formatMoneyAt = (amount: number, precision: number): string =>
  formatter(precision, true).format(amount ?? 0);

/** Same without the currency sign, for tables whose header already says the unit. */
export const formatAmountAt = (amount: number, precision: number): string =>
  formatter(precision, false).format(amount ?? 0);

/** Formats a signed amount using the site's negative-number preference. */
export const formatSignedAmountAt = (
  amount: number,
  precision: number,
  negativeFormat: NegativeNumberFormat = DEFAULT_NEGATIVE_NUMBER_FORMAT
): string => {
  const formatted = formatAmountAt(Math.abs(amount ?? 0), precision);
  if ((amount ?? 0) >= 0 || Number(formatted.replace(/\D/g, '')) === 0) return formatted;
  return negativeFormat === 'minus' ? `-${formatted}` : `(${formatted})`;
};

/** Currency version of `formatSignedAmountAt`. */
export const formatSignedMoneyAt = (
  amount: number,
  precision: number,
  negativeFormat: NegativeNumberFormat = DEFAULT_NEGATIVE_NUMBER_FORMAT
): string => {
  const formatted = formatMoneyAt(Math.abs(amount ?? 0), precision);
  if ((amount ?? 0) >= 0 || Number(formatted.replace(/\D/g, '')) === 0) return formatted;
  return negativeFormat === 'minus' ? `-${formatted}` : `(${formatted})`;
};
