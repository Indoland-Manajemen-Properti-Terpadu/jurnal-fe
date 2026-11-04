import { isValidImportDate, parseServerImportError, validateImportRow } from './importValidation';

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
    expect(validateImportRow({ ...row, Spent: '-5' })).toEqual([{ code: 'spentNumber' }]);
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
});
