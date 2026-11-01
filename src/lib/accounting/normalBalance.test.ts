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

describe('cost of sales and selling expenses', () => {
  it.each([
    'Harga Pokok Penjualan',
    'Beban Penjualan',
    'Biaya Penjualan',
    'Pokok Penjualan Barang',
  ])('are debit normal even though the name contains "penjualan": %s', (name) => {
    expect(isDebitNormal({ categoryName: name })).toBe(true);
  });

  it('keeps plain sales revenue credit normal', () => {
    expect(isDebitNormal({ categoryName: 'Penjualan' })).toBe(false);
    expect(isDebitNormal({ categoryName: 'Pendapatan Penjualan' })).toBe(false);
  });
});
