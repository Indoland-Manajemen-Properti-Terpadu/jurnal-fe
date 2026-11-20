import { AxiosError } from 'axios';
import { describe, expect, it } from 'vitest';
import { rowErrorsMessage } from './bankStatementApi';

describe('rowErrorsMessage', () => {
  const rejected = (errors: unknown) =>
    new AxiosError('x', '400', undefined, undefined, {
      status: 400,
      data: { data: { errors } },
    } as never);

  it('names the bad rows the server lists, at most three', () => {
    const text = rowErrorsMessage(
      rejected({ '2': ['a', 'b'], '5': ['c'], '7': ['d'], '9': ['e'] }),
      (row) => `Baris ${row}`
    );
    expect(text).toBe('Baris 2: a; b\nBaris 5: c\nBaris 7: d');
  });

  it('is empty without row errors', () => {
    expect(rowErrorsMessage(rejected(undefined), (row) => row)).toBe('');
    expect(rowErrorsMessage(new Error('x'), (row) => row)).toBe('');
  });
});
