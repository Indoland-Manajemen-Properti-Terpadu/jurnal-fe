import { getCategoryPrefix } from './accountTypes';

describe('getCategoryPrefix', () => {
  it('returns empty without a category and maps codes and names', () => {
    expect(getCategoryPrefix(undefined)).toBe('');
    expect(getCategoryPrefix({ categoryID: 'bln' })).toBe('8');
    expect(getCategoryPrefix({ name: 'Pendapatan Lain' })).toBe('7');
    expect(getCategoryPrefix({ name: 'Harga Pokok Penjualan' })).toBe('5');
    expect(getCategoryPrefix({ name: 'Hutang Usaha' })).toBe('2');
    expect(getCategoryPrefix({ name: 'Aset Tetap' })).toBe('1');
  });
});

describe('getCategoryPrefix code precedence', () => {
  it('trusts the backend code over a keyword in the name', () => {
    expect(getCategoryPrefix({ categoryID: 'HPP', name: 'Beban Pokok Penjualan' })).toBe('5');
    expect(getCategoryPrefix({ categoryID: 'KLL', name: 'Beban yang masih harus dibayar' })).toBe(
      '2'
    );
    expect(getCategoryPrefix({ categoryID: 'PEN', name: 'Pendapatan Beban' })).toBe('4');
    expect(getCategoryPrefix({ categoryID: 'BEB', name: 'Biaya Pendapatan' })).toBe('6');
  });

  it('falls back to the name when the code is unknown or missing', () => {
    expect(getCategoryPrefix({ categoryID: 'XYZ', name: 'Beban Gaji' })).toBe('6');
    expect(getCategoryPrefix({ name: 'Beban Gaji' })).toBe('6');
  });
});
