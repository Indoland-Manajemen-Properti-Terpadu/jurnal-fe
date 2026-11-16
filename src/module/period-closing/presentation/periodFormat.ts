import { fromMinor } from '@/lib/money/money';
import type { SupportedLanguage } from '@/i18n';
import type { PeriodType } from '@/module/period-closing/domain/accountingPeriod';
import {
  describeRange,
  isCalendarDay,
  type DateRange,
} from '@/module/period-closing/domain/periodRules';

const localeOf = (language: SupportedLanguage | string) => (language === 'en' ? 'en-GB' : 'id-ID');

/** A calendar day (`YYYY-MM-DD`) as text, read in UTC so it never moves to another day. */
export const formatDay = (day: string, language: SupportedLanguage | string): string => {
  if (!isCalendarDay(day)) return '—';
  const [year, month, date] = day.split('-').map(Number);
  return new Intl.DateTimeFormat(localeOf(language), {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, date)));
};

export const formatRange = (range: DateRange, language: SupportedLanguage | string): string =>
  `${formatDay(range.startDate, language)} – ${formatDay(range.endDate, language)}`;

const formatMonth = (year: number, month: number, language: SupportedLanguage | string) =>
  new Intl.DateTimeFormat(localeOf(language), {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)));

/** A default name for a period from what its range covers ("Tutup Buku 2025", "Kunci Januari 2026"). */
export const suggestPeriodName = (
  type: PeriodType,
  range: DateRange,
  language: SupportedLanguage | string,
  t: (key: string, params?: Record<string, string | number>) => string
): string => {
  if (!isCalendarDay(range.startDate) || !isCalendarDay(range.endDate)) return '';
  const shape = describeRange(range);
  const key = `names.${type}.${shape.kind}`;
  switch (shape.kind) {
    case 'year':
      return t(key, { year: shape.year });
    case 'quarter':
      return t(key, { quarter: shape.quarter, year: shape.year });
    case 'month':
      return t(key, { month: formatMonth(shape.year, shape.month, language) });
    default:
      return t(key, {
        start: formatDay(range.startDate, language),
        end: formatDay(range.endDate, language),
      });
  }
};

const moneyFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const amountFormatter = new Intl.NumberFormat('id-ID', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

/** Money held in minor units, with the currency sign. */
export const formatMinor = (minor: number): string =>
  moneyFormatter.format(Number(fromMinor(minor)));

/** Money held in minor units, without the sign (for columns whose header names the unit). */
export const formatMinorAmount = (minor: number): string =>
  amountFormatter.format(Number(fromMinor(minor)));

/** A report figure as the server sends it (rupiah, up to two decimals). */
export const formatAmount = (value: number | null | undefined): string =>
  value === null || value === undefined ? '' : amountFormatter.format(value);

export const formatMoney = (value: number): string => moneyFormatter.format(value);

const pad = (value: number) => String(value).padStart(2, '0');

const localDay = (moment: Date): string =>
  `${moment.getFullYear()}-${pad(moment.getMonth() + 1)}-${pad(moment.getDate())}`;

/** Today as a calendar day in the user's own time zone. */
export const todayDay = (): string => localDay(new Date());

/** The local calendar day of a timestamp (when something was created), not of a stored date. */
export const timestampDay = (timestamp: string): string => {
  const moment = new Date(timestamp);
  return Number.isNaN(moment.getTime()) ? '' : localDay(moment);
};
