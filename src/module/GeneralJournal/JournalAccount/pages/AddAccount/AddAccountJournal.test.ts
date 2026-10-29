import { getCategoryPrefix, resolveEffectiveDebit } from './AddAccountJournal';

describe('I5 contra flip when creating an account (characterization)', () => {
  it('uses the category flag and defaults to debit when unset', () => {
    expect(resolveEffectiveDebit(true, false)).toBe(true);
    expect(resolveEffectiveDebit(false, false)).toBe(false);
    expect(resolveEffectiveDebit(undefined, false)).toBe(true);
  });

  it('flips the side for a contra account', () => {
    expect(resolveEffectiveDebit(true, true)).toBe(false);
    expect(resolveEffectiveDebit(false, true)).toBe(true);
    expect(resolveEffectiveDebit(undefined, true)).toBe(false);
  });

  it('has no keyword fallback: a credit named category without a flag stays debit', () => {
    expect(resolveEffectiveDebit(undefined, false)).toBe(true);
  });
});

describe('I6 category prefix map in AddAccountJournal (characterization)', () => {
  const prefix = (categoryID: string, name = '') => getCategoryPrefix({ categoryID, name });

  it('returns an empty prefix without a category', () => {
    expect(getCategoryPrefix(undefined)).toBe('');
  });

  it.each([
    ['BLN', '', '8'],
    ['PLN', '', '7'],
    ['BEB', '', '6'],
    ['HPP', '', '5'],
    ['PEN', '', '4'],
    ['EKU', '', '3'],
    ['AH', '', '2'],
    ['KLL', '', '2'],
    ['KJP', '', '2'],
    ['KB', 'Kas & Bank', '1'],
  ])('maps code %s to %s', (code, name, expected) => {
    expect(prefix(code, name)).toBe(expected);
  });

  it.each([
    ['Beban Lain-lain', '8'],
    ['Pendapatan Lain', '7'],
    ['Beban Gaji', '6'],
    ['Biaya Umum', '6'],
    ['Harga Pokok Penjualan', '5'],
    ['Pokok Penjualan', '5'],
    ['Pendapatan Usaha', '4'],
    ['Ekuitas', '3'],
    ['Modal Disetor', '3'],
    ['Hutang Usaha', '2'],
    ['Kewajiban Lancar', '2'],
    ['Liabilitas', '2'],
    ['Aset Tetap', '1'],
  ])('maps the name %s to %s when the code is unknown', (name, expected) => {
    expect(prefix('XXX', name)).toBe(expected);
  });

  it('matches the code case-insensitively and prefers the more specific name', () => {
    expect(prefix('beb')).toBe('6');
    expect(prefix('XXX', 'Beban Lain')).toBe('8');
  });
});
