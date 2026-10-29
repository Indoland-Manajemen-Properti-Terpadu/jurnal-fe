import { getNormalBalance } from './normalBalance';

describe('I5 getNormalBalance', () => {
  describe('keyword fallback (backend sends no flag)', () => {
    it.each(['kewajiban', 'hutang', 'liabilitas', 'modal', 'ekuitas', 'pendapatan', 'penjualan'])(
      'returns Kredit for the keyword %s, in any case',
      (word) => {
        expect(getNormalBalance({ categoryName: word })).toBe('Kredit');
        expect(getNormalBalance({ categoryName: `Total ${word.toUpperCase()}` })).toBe('Kredit');
      }
    );

    it('returns Debit for other categories and for empty input', () => {
      expect(getNormalBalance({ categoryName: 'Kas & Bank' })).toBe('Debit');
      expect(getNormalBalance({ categoryName: 'Beban Gaji' })).toBe('Debit');
      expect(getNormalBalance({})).toBe('Debit');
      expect(getNormalBalance({ categoryName: '' })).toBe('Debit');
    });

    it('falls back to the type when the category name is empty', () => {
      expect(getNormalBalance({ type: 'Hutang' })).toBe('Kredit');
      expect(getNormalBalance({ categoryName: '', type: 'Modal' })).toBe('Kredit');
    });

    it('ignores the type when a category name exists', () => {
      expect(getNormalBalance({ categoryName: 'Kas', type: 'Hutang' })).toBe('Debit');
    });
  });

  describe('backend flags', () => {
    it('lets the backend isDebit flag win over the keywords', () => {
      expect(getNormalBalance({ categoryName: 'Hutang Usaha', isDebit: true })).toBe('Debit');
      expect(getNormalBalance({ categoryName: 'Kas & Bank', isDebit: false })).toBe('Kredit');
    });

    it('flips the side for a contra account', () => {
      expect(getNormalBalance({ categoryName: 'Aset Tetap', isDebit: true, isContra: true })).toBe(
        'Kredit'
      );
      expect(getNormalBalance({ isDebit: false, isContra: true })).toBe('Debit');
    });

    it('flips the keyword result for a contra account when the flag is missing', () => {
      expect(getNormalBalance({ categoryName: 'Modal', isContra: true })).toBe('Debit');
    });

    it('does not flip when isContra is false or missing', () => {
      expect(getNormalBalance({ isDebit: true, isContra: false })).toBe('Debit');
      expect(getNormalBalance({ isDebit: false })).toBe('Kredit');
    });
  });
});
