/** Chart of accounts numbering prefix (1 to 8) for a category, by backend code or name. */
const PREFIX_BY_CODE: Record<string, string> = {
  BLN: '8',
  PLN: '7',
  BEB: '6',
  HPP: '5',
  PEN: '4',
  EKU: '3',
  AH: '2',
  KLL: '2',
  KJP: '2',
};

/** The backend category code decides; the Indonesian name is only the fallback for unknown codes. */
export const getCategoryPrefix = (cat?: { categoryID?: string; name?: string }): string => {
  if (!cat) return '';
  const known = PREFIX_BY_CODE[(cat.categoryID || '').toUpperCase()];
  if (known) return known;
  const name = (cat.name || '').toLowerCase();

  if (name.includes('beban lain')) return '8';
  if (name.includes('pendapatan lain')) return '7';
  if (name.includes('beban') || name.includes('biaya')) return '6';
  if (name.includes('harga pokok') || name.includes('pokok penjualan')) return '5';
  if (name.includes('pendapatan')) return '4';
  if (name.includes('ekuitas') || name.includes('modal')) return '3';
  if (name.includes('hutang') || name.includes('kewajiban') || name.includes('liabilitas')) {
    return '2';
  }
  return '1';
};
