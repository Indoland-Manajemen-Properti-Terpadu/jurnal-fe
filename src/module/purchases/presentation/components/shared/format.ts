/** Display helpers shared by every purchasing screen. Amounts are rupiah as the server sends them. */

/**
 * Decimal digits of money. The general settings decide (`GET /purchase-dashboard/config`); the purchasing
 * pages store it here once it is known so that every amount, however deep in a table, follows it.
 */
let amountPrecision = 2;

export const setAmountPrecision = (precision: number): void => {
  if (Number.isInteger(precision) && precision >= 0 && precision <= 6) {
    amountPrecision = precision;
  }
};

export const formatAmount = (amount: number, precision?: number): string =>
  amount.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: precision ?? 0,
    maximumFractionDigits: precision ?? amountPrecision,
  });

/** `YYYY-MM-DD` shown as a calendar day in the reader's language, never shifted by time zone. */
export const formatDay = (value: string | null | undefined, language: string): string => {
  if (!value) return '-';
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return '-';
  return new Intl.DateTimeFormat(language === 'id' ? 'id-ID' : 'en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, day)));
};

export const formatQuantity = (value: number): string =>
  value.toLocaleString('id-ID', { maximumFractionDigits: 4 });

/** Today as `YYYY-MM-DD` in the local calendar. */
export const todayIso = (): string => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const value = (part: 'year' | 'month' | 'day') =>
    parts.find((item) => item.type === part)?.value ?? '';
  return `${value('year')}-${value('month')}-${value('day')}`;
};

/** A `YYYY-MM-DD` string from a date input value (Date or null). */
export const toIsoDay = (value: Date | string | null): string => {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${value.getFullYear()}-${month}-${day}`;
};

export const fromIsoDay = (value: string): Date | null => {
  if (!value) return null;
  const [year, month, day] = value.split('-').map(Number);
  return year && month && day ? new Date(year, month - 1, day) : null;
};
