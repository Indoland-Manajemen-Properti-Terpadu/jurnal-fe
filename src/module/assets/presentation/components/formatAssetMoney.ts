import { formatMoneyAt } from '@/utils/formatMoney';

/** Every digit of the site precision (`Rp 35.000.000,00`); the amount is the API's, never recomputed. */
export const formatAssetMoney = (amount: number, precision: number): string =>
  formatMoneyAt(amount, precision);

const compact = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  notation: 'compact',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

/**
 * Short form for the cards (`Rp 13 jt`) so a large amount fits beside a small chart; below one
 * million it stays exact. Cards give the exact amount in a tooltip and the tables show it in full.
 */
export const formatAssetMoneyShort = (amount: number, precision: number): string =>
  Math.abs(amount) < 1_000_000 ? formatAssetMoney(amount, precision) : compact.format(amount);
