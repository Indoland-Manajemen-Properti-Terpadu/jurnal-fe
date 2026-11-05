/** Display helpers shared by every purchasing screen. Amounts are rupiah as the server sends them. */

export const formatAmount = (amount: number): string =>
  amount.toLocaleString('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
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
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
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
