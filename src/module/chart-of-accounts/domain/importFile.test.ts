import { MAX_IMPORT_FILE_BYTES, validateImportFile } from './importFile';

describe('validateImportFile', () => {
  it('accepts spreadsheet files up to 5 MB, whatever the letter case', () => {
    expect(validateImportFile({ name: 'akun.xlsx', size: 1000 })).toBeNull();
    expect(validateImportFile({ name: 'AKUN.CSV', size: MAX_IMPORT_FILE_BYTES })).toBeNull();
    expect(validateImportFile({ name: 'akun.xls', size: 10 })).toBeNull();
  });

  it('rejects another format', () => {
    expect(validateImportFile({ name: 'akun.pdf', size: 10 })).toBe('type');
  });

  it('rejects a file over 5 MB', () => {
    expect(validateImportFile({ name: 'akun.xlsx', size: MAX_IMPORT_FILE_BYTES + 1 })).toBe('size');
  });
});
