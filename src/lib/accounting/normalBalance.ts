/**
 * Normal balance (the side an account grows on). The backend category flag wins; without it an
 * Indonesian category-name keyword decides; a contra account flips the result.
 */

const CREDIT_KEYWORDS = [
  'kewajiban',
  'hutang',
  'liabilitas',
  'modal',
  'ekuitas',
  'pendapatan',
  'penjualan',
];

export interface NormalBalanceInput {
  isDebit?: boolean;
  isContra?: boolean;
  categoryName?: string;
}

/** Cost of sales and selling expenses contain "penjualan" but grow on the debit side. */
const DEBIT_PHRASES = ['harga pokok', 'pokok penjualan', 'beban penjualan', 'biaya penjualan'];

export const isCreditCategoryName = (categoryName?: string): boolean => {
  const name = (categoryName || '').toLowerCase();
  if (DEBIT_PHRASES.some((phrase) => name.includes(phrase))) return false;
  return CREDIT_KEYWORDS.some((keyword) => name.includes(keyword));
};

export const isDebitNormal = ({ isDebit, isContra, categoryName }: NormalBalanceInput): boolean => {
  const base = typeof isDebit === 'boolean' ? isDebit : !isCreditCategoryName(categoryName);
  return isContra ? !base : base;
};
