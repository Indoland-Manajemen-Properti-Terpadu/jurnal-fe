import { describe, expect, it } from 'vitest';
import { ContactImportError, parseImportFailure } from './contactImport';

describe('parseImportFailure', () => {
  it('reads the summary and every problem of the server answer', () => {
    const error = parseImportFailure({
      code: 400,
      message: 'Impor dibatalkan: 4 dari 4 baris tidak valid.',
      data: [
        { row: 6, field: 'AR Account Code', message: 'Akun piutang 6-60007 berkategori Beban' },
        { row: 6, field: 'Identity Number', message: 'NIK KTP harus 16 digit angka (diisi "123")' },
      ],
    });

    expect(error).toBeInstanceOf(ContactImportError);
    expect(error?.message).toBe('Impor dibatalkan: 4 dari 4 baris tidak valid.');
    expect(error?.issues).toEqual([
      { row: 6, field: 'AR Account Code', reason: 'Akun piutang 6-60007 berkategori Beban' },
      { row: 6, field: 'Identity Number', reason: 'NIK KTP harus 16 digit angka (diisi "123")' },
    ]);
  });

  it('keeps a null column as null: the problem belongs to the whole row', () => {
    const error = parseImportFailure({
      message: 'x',
      data: [{ row: 3, field: null, message: 'Baris kosong' }],
    });
    expect(error?.issues).toEqual([{ row: 3, field: null, reason: 'Baris kosong' }]);
  });

  it('drops entries it cannot read and gives up when none is left', () => {
    const mixed = parseImportFailure({
      message: 'x',
      data: [{ row: 'abc', message: 'bad' }, null, { row: 2, message: 'ok' }],
    });
    expect(mixed?.issues).toEqual([{ row: 2, field: null, reason: 'ok' }]);
    expect(parseImportFailure({ message: 'x', data: [{ row: 'abc' }] })).toBeNull();
  });

  it('is null for an answer without row details', () => {
    expect(parseImportFailure({ message: 'Import validation failed' })).toBeNull();
    expect(parseImportFailure({ message: 'x', data: [] })).toBeNull();
    expect(parseImportFailure(null)).toBeNull();
    expect(parseImportFailure('text')).toBeNull();
  });
});
