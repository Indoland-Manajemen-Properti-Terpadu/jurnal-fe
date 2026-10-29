/** Chart of accounts numbering prefix (1 to 8) for a category, by backend code or name. */
export const getCategoryPrefix = (cat?: { categoryID?: string; name?: string }): string => {
  if (!cat) return '';
  const code = (cat.categoryID || '').toUpperCase();
  const name = (cat.name || '').toLowerCase();

  if (code === 'BLN' || name.includes('beban lain')) return '8';
  if (code === 'PLN' || name.includes('pendapatan lain')) return '7';
  if (code === 'BEB' || name.includes('beban') || name.includes('biaya')) return '6';
  if (code === 'HPP' || name.includes('harga pokok') || name.includes('pokok penjualan')) {
    return '5';
  }
  if (code === 'PEN' || name.includes('pendapatan')) return '4';
  if (code === 'EKU' || name.includes('ekuitas') || name.includes('modal')) return '3';
  if (
    code === 'AH' ||
    code === 'KLL' ||
    code === 'KJP' ||
    name.includes('hutang') ||
    name.includes('kewajiban') ||
    name.includes('liabilitas')
  ) {
    return '2';
  }
  return '1';
};
