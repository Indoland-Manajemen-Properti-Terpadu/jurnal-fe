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
