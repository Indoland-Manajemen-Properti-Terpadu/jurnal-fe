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

export const isCreditCategoryName = (categoryName?: string): boolean => {
  const name = (categoryName || '').toLowerCase();
  return CREDIT_KEYWORDS.some((keyword) => name.includes(keyword));
};

export const isDebitNormal = ({ isDebit, isContra, categoryName }: NormalBalanceInput): boolean => {
  const base = typeof isDebit === 'boolean' ? isDebit : !isCreditCategoryName(categoryName);
  return isContra ? !base : base;
};
