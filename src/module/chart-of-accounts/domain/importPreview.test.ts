import { buildImportPreviewRows } from './importPreview';

const correct = [
  { accountNumber: '1-10001', name: 'Kas Kecil', categoryName: 'Kas & Bank' },
  { accountNumber: '4-10001', name: 'Penjualan', categoryName: 'Pendapatan' },
];
const wrong = [
  { item: { accountNumber: '1-10001', name: 'Duplikat' }, errorItem: ['Nomor akun duplikat'] },
];

describe('buildImportPreviewRows', () => {
  it('lists valid rows first, then invalid rows with their errors', () => {
    const rows = buildImportPreviewRows(correct, wrong, 'all', '');
    expect(rows.map((r) => r.isValid)).toEqual([true, true, false]);
    expect(rows[2].errors).toEqual(['Nomor akun duplikat']);
  });

  it('filters by status', () => {
    expect(buildImportPreviewRows(correct, wrong, 'valid', '')).toHaveLength(2);
    expect(buildImportPreviewRows(correct, wrong, 'invalid', '')).toHaveLength(1);
  });

  it('searches code, name and category case-insensitively and ignores a blank query', () => {
    expect(buildImportPreviewRows(correct, wrong, 'all', 'PENJ')).toHaveLength(1);
    expect(buildImportPreviewRows(correct, wrong, 'all', 'kas & bank')).toHaveLength(1);
    expect(buildImportPreviewRows(correct, wrong, 'all', '1-10001')).toHaveLength(2);
    expect(buildImportPreviewRows(correct, wrong, 'all', '   ')).toHaveLength(3);
  });
});
