import { formatCurrency } from '@/utils/formatCurrency';

/** Whole rupiah without ",00"; amounts with cents keep both decimals so nothing is rounded away. */
export const formatAssetMoney = (amount: number): string =>
  formatCurrency(amount, !Number.isInteger(amount));

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
export const formatAssetMoneyShort = (amount: number): string =>
  Math.abs(amount) < 1_000_000 ? formatAssetMoney(amount) : compact.format(amount);
