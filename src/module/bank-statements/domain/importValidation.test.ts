import type { BankStatementPreviewItem } from './importPreview';
import {
  isValidImportDate,
  parseServerImportError,
  recheckPreviewRow,
  validateImportRow,
} from './importValidation';

const row = { Description: 'SETORAN', TransactionDate: '01/11/2026', Received: '100', Spent: '0' };

describe('isValidImportDate', () => {
  it('accepts a real dd/mm/yyyy date only', () => {
    expect(isValidImportDate('01/11/2026')).toBe(true);
    expect(isValidImportDate('29/02/2028')).toBe(true);
    expect(isValidImportDate('31/02/2026')).toBe(false);
    expect(isValidImportDate('2026-11-01')).toBe(false);
    expect(isValidImportDate('')).toBe(false);
  });
});

describe('validateImportRow', () => {
  it('has no error for a complete row with one side', () => {
    expect(validateImportRow(row)).toEqual([]);
    expect(validateImportRow({ ...row, Received: '0', Spent: '250000.50' })).toEqual([]);
  });

  it('asks for a description and a real date', () => {
    expect(validateImportRow({ ...row, Description: '  ' })).toEqual([{ code: 'description' }]);
    expect(validateImportRow({ ...row, TransactionDate: '31/02/2026' })).toEqual([
      { code: 'date' },
    ]);
  });

  it('wants exactly one side greater than zero', () => {
    expect(validateImportRow({ ...row, Spent: '5' })).toEqual([{ code: 'bothSides' }]);
    expect(validateImportRow({ ...row, Received: '0' })).toEqual([{ code: 'noSide' }]);
    expect(validateImportRow({ ...row, Received: '' })).toEqual([{ code: 'noSide' }]);
  });

  it('rejects thousand separators, a decimal comma and negative numbers', () => {
    expect(validateImportRow({ ...row, Received: '1.000.000,50' })).toEqual([
      { code: 'receivedNumber' },
    ]);
  });

  it('names a negative amount instead of blaming the thousand separator', () => {
    expect(validateImportRow({ ...row, Received: '0', Spent: '-5000' })).toEqual([
      { code: 'negativeAmount' },
    ]);
    expect(validateImportRow({ ...row, Received: '-1' })).toEqual([{ code: 'negativeAmount' }]);
  });
});

describe('parseServerImportError', () => {
  it('maps the known server messages and ignores the unknown ones', () => {
    expect(parseServerImportError('Description must be less than 1000 characters')).toEqual({
      code: 'description',
    });
    expect(parseServerImportError('TransactionDate is required and must be a valid date')).toEqual({
      code: 'date',
    });
    expect(parseServerImportError('Only one of Received or Spent can be greater than 0')).toEqual({
      code: 'bothSides',
    });
    expect(parseServerImportError('Unexpected field(s): Transaction')).toEqual({
      code: 'unexpectedColumn',
      detail: 'Transaction',
    });
    expect(parseServerImportError('Something new')).toBeNull();
  });

  it('maps the Indonesian messages the server sends since PRO-100', () => {
    expect(
      parseServerImportError('Hanya salah satu dari Received atau Spent yang boleh lebih dari 0')
    ).toEqual({ code: 'bothSides' });
    expect(
      parseServerImportError('Salah satu dari Received atau Spent harus lebih dari 0')
    ).toEqual({ code: 'noSide' });
    expect(parseServerImportError('Spent tidak boleh negatif. Isi nominal keluar')).toEqual({
      code: 'negativeAmount',
    });
    expect(parseServerImportError('Received harus berupa angka tanpa pemisah ribuan')).toEqual({
      code: 'receivedNumber',
    });
    expect(parseServerImportError('Description wajib diisi')).toEqual({ code: 'description' });
  });
});

const previewRow = (over: Partial<BankStatementPreviewItem> = {}): BankStatementPreviewItem => ({
  rowIndex: 1,
  TransactionDate: '20/11/2026',
  Received: '10000',
  Spent: '0',
  Description: 'Setoran',
  date: null,
  received: null,
  spent: null,
  amount: null,
  description: '',
  isDateValid: true,
  isReceivedValid: true,
  isSpentValid: true,
  isDescriptionValid: true,
  isValid: true,
  errors: [],
  ...over,
});

describe('recheckPreviewRow', () => {
  it('leaves a row alone when it passes every rule', () => {
    const ok = previewRow();
    expect(recheckPreviewRow(ok)).toBe(ok);
  });

  it('marks invalid a row the server passed with an ISO date', () => {
    const checked = recheckPreviewRow(previewRow({ TransactionDate: '2026-11-20' }));
    expect(checked.isValid).toBe(false);
    expect(checked.errors.map((m) => parseServerImportError(m))).toEqual([{ code: 'date' }]);
  });

  it('marks invalid a row the server passed with an empty description', () => {
    const checked = recheckPreviewRow(previewRow({ Description: '' }));
    expect(checked.isValid).toBe(false);
    expect(checked.errors.map((m) => parseServerImportError(m))).toEqual([{ code: 'description' }]);
  });

  it('replaces the misleading server message of a negative amount', () => {
    const checked = recheckPreviewRow(
      previewRow({
        Received: '0',
        Spent: '-5000',
        isValid: false,
        errors: ['Spent is required and must be a valid number'],
      })
    );
    expect(checked.errors.map((m) => parseServerImportError(m))).toEqual([
      { code: 'negativeAmount' },
    ]);
  });

  it('keeps a server message the app does not know', () => {
    const checked = recheckPreviewRow(
      previewRow({ Description: '', isValid: false, errors: ['Something new'] })
    );
    expect(checked.errors[0]).toBe('Something new');
    expect(checked.errors).toHaveLength(2);
  });
});
