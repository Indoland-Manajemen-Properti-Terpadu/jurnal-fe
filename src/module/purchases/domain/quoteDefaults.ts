import type { TaxRef } from '@/module/purchases/domain/purchaseCommon';
import type { RequestItem } from '@/module/purchases/domain/purchaseRequest';

/** A new quote is valid for this many days unless the person changes the date. */
export const QUOTE_VALID_DAYS = 14;

export type WarrantyUnit = 'day' | 'month' | 'year';

/** The words a warranty is written with, as the prototype saves it ("12 bulan"). */
const WARRANTY_WORDS: Record<WarrantyUnit, string> = {
  day: 'hari',
  month: 'bulan',
  year: 'tahun',
};

/** `YYYY-MM-DD` plus a number of days, without a time zone to shift it. */
export const addDays = (iso: string, days: number): string => {
  const date = new Date(`${iso}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
};

/**
 * Reads a warranty text. "12 bulan" is a number and a unit; anything else an older quote may hold
 * stays as it was, so editing the quote does not lose it.
 */
export const parseWarranty = (
  text: string
): { value: number | ''; unit: WarrantyUnit; legacy: string } => {
  const trimmed = text.trim();
  const match = /^(\d+)\s*(hari|bulan|tahun)$/i.exec(trimmed);
  if (!match) return { value: '', unit: 'month', legacy: trimmed };
  const unit = (Object.keys(WARRANTY_WORDS) as WarrantyUnit[]).find(
    (key) => WARRANTY_WORDS[key] === match[2].toLowerCase()
  );
  return { value: Number(match[1]), unit: unit ?? 'month', legacy: '' };
};

export const warrantyFields = (text: string) => {
  const { value, unit, legacy } = parseWarranty(text);
  return { warrantyValue: value, warrantyUnit: unit, warrantyLegacy: legacy };
};

/** The warranty as the one text the service keeps; the old text stands while no number is given. */
export const composeWarranty = (values: {
  warrantyValue: number | '';
  warrantyUnit: WarrantyUnit;
  warrantyLegacy: string;
}): string =>
  values.warrantyValue === ''
    ? values.warrantyLegacy
    : `${values.warrantyValue} ${WARRANTY_WORDS[values.warrantyUnit]}`;

/** The 11% VAT, the tax a quote line starts with; none when the list has no such tax. */
export const defaultTaxId = (taxes: TaxRef[]): string =>
  taxes.find((tax) => tax.rate === 11 && /ppn/i.test(tax.name))?.id ?? '';

/** Goods terms for a request of goods, service terms for services; a mixed request sees them all. */
export const appliesToOf = (items: RequestItem[]): 'goods' | 'service' | undefined => {
  if (items.length === 0) return undefined;
  if (items.every((item) => item.kind === 'GOODS')) return 'goods';
  if (items.every((item) => item.kind === 'SERVICE')) return 'service';
  return undefined;
};
