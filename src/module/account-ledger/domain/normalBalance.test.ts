import { getNormalBalance } from './normalBalance';

describe('I5 getNormalBalance (characterization of the ledger screen)', () => {
  it.each(['kewajiban', 'hutang', 'liabilitas', 'modal', 'ekuitas', 'pendapatan', 'penjualan'])(
    'returns Kredit for the keyword %s, in any case',
    (word) => {
      expect(getNormalBalance(word)).toBe('Kredit');
      expect(getNormalBalance(`Total ${word.toUpperCase()}`)).toBe('Kredit');
    }
  );

  it('returns Debit for other categories and for empty input', () => {
    expect(getNormalBalance('Kas & Bank')).toBe('Debit');
    expect(getNormalBalance('Beban Gaji')).toBe('Debit');
    expect(getNormalBalance()).toBe('Debit');
    expect(getNormalBalance('')).toBe('Debit');
  });

  it('falls back to the type when the category name is empty', () => {
    expect(getNormalBalance(undefined, 'Hutang')).toBe('Kredit');
    expect(getNormalBalance('', 'Modal')).toBe('Kredit');
  });

  it('ignores the type when a category name exists', () => {
    expect(getNormalBalance('Kas', 'Hutang')).toBe('Debit');
  });

  it('has no backend flag and no contra input', () => {
    expect(getNormalBalance.length).toBe(2);
  });
});
