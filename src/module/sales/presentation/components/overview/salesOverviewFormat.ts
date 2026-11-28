import type { SupportedLanguage } from '@/i18n';

const localeFor = (language: SupportedLanguage) => (language === 'en' ? 'en-ID' : 'id-ID');

export const formatOverviewMoney = (
  value: number,
  precision: number,
  language: SupportedLanguage
): string =>
  new Intl.NumberFormat(localeFor(language), {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);

export const formatOverviewCompactMoney = (value: number, language: SupportedLanguage): string =>
  new Intl.NumberFormat(localeFor(language), {
    style: 'currency',
    currency: 'IDR',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

export const formatOverviewCount = (value: number, language: SupportedLanguage): string =>
  new Intl.NumberFormat(localeFor(language)).format(value);

export const formatOverviewPercent = (value: number, language: SupportedLanguage): string =>
  new Intl.NumberFormat(localeFor(language), { maximumFractionDigits: 1 }).format(value);

/** The API snapshot is a timestamp; sales periods follow the Jakarta calendar day. */
const jakartaDate = (value: string) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  }).formatToParts(new Date(value));
  const component = (type: string) => Number(parts.find((part) => part.type === type)?.value);
  return new Date(Date.UTC(component('year'), component('month') - 1, component('day')));
};

const monthName = (date: Date, language: SupportedLanguage) =>
  new Intl.DateTimeFormat(localeFor(language), {
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(date);

const rangeName = (start: Date, end: Date, language: SupportedLanguage) => {
  const formatter = new Intl.DateTimeFormat(localeFor(language), {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  });
  const month = new Intl.DateTimeFormat(localeFor(language), { month: 'short', timeZone: 'UTC' });
  const startLabel = formatter.format(start);
  const endLabel = formatter.format(end);
  if (start.getUTCMonth() === end.getUTCMonth()) {
    return `${start.getUTCDate()}–${end.getUTCDate()} ${month.format(end)}`;
  }
  return `${startLabel} – ${endLabel}`;
};

export const overviewMonthLabels = (asOf: string, language: SupportedLanguage) => {
  const date = jakartaDate(asOf);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const firstOfCurrentMonth = new Date(Date.UTC(year, month, 1));
  const firstOfPreviousMonth = new Date(Date.UTC(year, month - 1, 1));
  const previousMonthLastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const comparableEnd = new Date(
    Date.UTC(year, month - 1, Math.min(date.getUTCDate(), previousMonthLastDay))
  );

  return {
    monthKey: `${year}-${String(month + 1).padStart(2, '0')}`,
    currentMonth: monthName(date, language),
    previousMonth: monthName(firstOfPreviousMonth, language),
    currentRange: rangeName(firstOfCurrentMonth, date, language),
    previousComparableRange: rangeName(firstOfPreviousMonth, comparableEnd, language),
  };
};

export const overviewMonthProgress = (current: number, previousFull: number): number =>
  previousFull <= 0 ? 0 : Math.min(100, Math.max(0, (current / previousFull) * 100));
