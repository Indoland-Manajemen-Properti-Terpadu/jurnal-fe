import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { classifySaleError, retryUnlessNotFound } from './saleErrors';

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

  it('keeps a service-unavailable email message from the API', () => {
    expect(
      classifySaleError(failure(503, { message: 'Server email (SMTP) belum dikonfigurasi, email tidak dapat dikirim.' }))
    ).toEqual({
      kind: 'domain',
      serverMessage: 'Server email (SMTP) belum dikonfigurasi, email tidak dapat dikirim.',
    });
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

describe('retryUnlessNotFound', () => {
  const answer = (status: number) => failure(status, {});

  it('gives up at once on an unknown id', () => {
    expect(retryUnlessNotFound(0, answer(404))).toBe(false);
  });

  it('retries a failure that may pass, up to twice', () => {
    expect(retryUnlessNotFound(0, answer(500))).toBe(true);
    expect(retryUnlessNotFound(2, answer(500))).toBe(false);
  });
});

describe('classifySaleError for an inactive payment term', () => {
  it('keeps the server sentence so the form can show why the save was refused', () => {
    expect(
      classifySaleError(
        failure(400, {
          code: 400,
          message: 'Syarat pembayaran sudah nonaktif, pilih syarat pembayaran lain',
          data: null,
        })
      )
    ).toEqual({
      kind: 'domain',
      serverMessage: 'Syarat pembayaran sudah nonaktif, pilih syarat pembayaran lain',
    });
  });
});
