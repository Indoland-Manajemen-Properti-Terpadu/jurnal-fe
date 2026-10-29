import { isCreditCategoryName, isDebitNormal } from './normalBalance';

describe('isDebitNormal', () => {
  it('the backend flag wins over the keyword', () => {
    expect(isDebitNormal({ isDebit: true, categoryName: 'Hutang Usaha' })).toBe(true);
    expect(isDebitNormal({ isDebit: false, categoryName: 'Kas' })).toBe(false);
  });

  it.each(['kewajiban', 'hutang', 'liabilitas', 'modal', 'ekuitas', 'pendapatan', 'penjualan'])(
    'falls back to credit for %s',
    (word) => {
      expect(isDebitNormal({ categoryName: `Total ${word.toUpperCase()}` })).toBe(false);
      expect(isCreditCategoryName(word)).toBe(true);
    }
  );

  it('falls back to debit otherwise', () => {
    expect(isDebitNormal({ categoryName: 'Kas & Bank' })).toBe(true);
    expect(isDebitNormal({})).toBe(true);
  });

  it('contra flips the side', () => {
    expect(isDebitNormal({ isDebit: true, isContra: true })).toBe(false);
    expect(isDebitNormal({ isDebit: false, isContra: true })).toBe(true);
    expect(isDebitNormal({ categoryName: 'Modal', isContra: true })).toBe(true);
  });
});
