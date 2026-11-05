import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { classifySaleError } from './saleErrors';

const failure = (status: number, data: unknown) =>
  new AxiosError('failed', String(status), undefined, undefined, {
    status,
    data,
  } as AxiosResponse);

describe('classifySaleError', () => {
  it('treats a business refusal as domain and keeps its message', () => {
    expect(
      classifySaleError(failure(400, { message: 'Akun kas kecil tidak boleh dipakai.' }))
    ).toEqual({ kind: 'domain', serverMessage: 'Akun kas kecil tidak boleh dipakai.' });
  });

  it('treats field errors as validation and drops the text', () => {
    expect(
      classifySaleError(
        failure(400, { message: '"x" is required', data: [{ field: 'x', message: 'required' }] })
      )
    ).toEqual({ kind: 'validation' });
  });

  it('maps statuses and a missing response', () => {
    expect(classifySaleError(failure(401, {})).kind).toBe('unauthorized');
    expect(classifySaleError(failure(403, { message: 'Forbidden Access Role' })).kind).toBe(
      'forbidden'
    );
    expect(classifySaleError(failure(404, {})).kind).toBe('notFound');
    expect(classifySaleError(failure(502, '<html>')).kind).toBe('unknown');
    expect(classifySaleError(new AxiosError('offline')).kind).toBe('network');
    expect(classifySaleError(new Error('x')).kind).toBe('unknown');
  });
});
