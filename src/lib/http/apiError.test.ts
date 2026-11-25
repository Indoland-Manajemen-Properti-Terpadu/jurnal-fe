import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import { ApiError, describeApiError, toApiError, type ApiErrorMessages } from './apiError';

const respond = (status: number, data: unknown) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {},
  } as AxiosResponse);

const messages: ApiErrorMessages = {
  rejected: 'rejected',
  forbidden: 'forbidden',
  validation: 'validation',
  unauthorized: 'unauthorized',
  notFound: 'notFound',
  network: 'network',
  generic: 'generic',
};

describe('toApiError', () => {
  it('keeps the Indonesian business message of a refused request', () => {
    const error = toApiError(respond(400, { code: 400, message: 'Nama departemen sudah dipakai' }));

    expect(error.kind).toBe('domain');
    expect(error.serverMessage).toBe('Nama departemen sudah dipakai');
  });

  it('treats a 400 with a field list as validation and keeps the fields', () => {
    const error = toApiError(
      respond(400, {
        message: '"name" is required',
        data: [{ field: 'name', message: '"name" is required' }],
        stack: 'Error: boom\n at somewhere',
      })
    );

    expect(error.kind).toBe('validation');
    expect(error.fieldErrors).toEqual([{ field: 'name', message: '"name" is required' }]);
    expect(error.serverMessage).toBeUndefined();
  });

  it('keeps the sentence of a validation refusal apart, for a screen that may show it', () => {
    const error = toApiError(
      respond(400, {
        message:
          'Payment voucher belum bisa diterbitkan (PT Geruite): Isi rekening bank vendor di data kontak',
        data: [
          { field: 'vendor.bankAccounts', message: 'Isi rekening bank vendor di data kontak' },
        ],
      })
    );

    expect(error.kind).toBe('validation');
    expect(error.serverMessage).toBeUndefined();
    expect(error.validationMessage).toBe(
      'Payment voucher belum bisa diterbitkan (PT Geruite): Isi rekening bank vendor di data kontak'
    );
  });

  it('keeps a 400 whose list has no fields as a business refusal with its details', () => {
    const error = toApiError(
      respond(400, {
        message: 'Harga faktur berbeda dari PO/SPK pada 1 baris. Konfirmasi selisih',
        data: [{ type: 'TOTAL', expected: 3330000, actual: 3000000 }],
      })
    );

    expect(error.kind).toBe('domain');
    expect(error.details).toEqual([{ type: 'TOTAL', expected: 3330000, actual: 3000000 }]);
  });

  it('keeps the count that blocks a 409 so the screen can link to it', () => {
    const error = toApiError(
      respond(409, {
        message:
          'Gudang Utama sedang diopname (SO/2026/11/0012). Selesaikan atau batalkan opname dulu',
        data: { opname: { id: 'op1', number: 'SO/2026/11/0012' } },
      })
    );

    expect(error.kind).toBe('domain');
    expect(error.blockingOpname).toEqual({ id: 'op1', number: 'SO/2026/11/0012' });
  });

  it('has no blocking count when a refusal carries none', () => {
    expect(
      toApiError(respond(409, { message: 'Bentrok', data: null })).blockingOpname
    ).toBeUndefined();
  });

  it.each([
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'notFound'],
    [502, 'network'],
    [500, 'unknown'],
  ])('maps status %i to %s', (status, kind) => {
    expect(toApiError(respond(status, { message: 'x' })).kind).toBe(kind);
  });

  it('reports a request with no response as a network failure', () => {
    expect(toApiError(new AxiosError('offline')).kind).toBe('network');
  });

  it('returns an ApiError unchanged and turns anything else into unknown', () => {
    const own = new ApiError({ kind: 'notFound' });

    expect(toApiError(own)).toBe(own);
    expect(toApiError(new Error('oops')).kind).toBe('unknown');
  });
});

describe('describeApiError', () => {
  const duplicate = respond(400, { message: 'Nama departemen sudah dipakai' });

  it('shows the Indonesian business message to Indonesian readers only', () => {
    expect(describeApiError(duplicate, 'id', messages)).toBe('Nama departemen sudah dipakai');
    expect(describeApiError(duplicate, 'en', messages)).toBe('rejected');
  });

  it('never shows validation text, server errors or a bare role refusal', () => {
    const invalid = respond(400, { message: '"name" is required', data: [{ field: 'name' }] });

    expect(describeApiError(invalid, 'id', messages)).toBe('validation');
    expect(describeApiError(respond(500, { message: 'db down' }), 'id', messages)).toBe('generic');
    expect(
      describeApiError(respond(403, { message: 'Forbidden Access Role' }), 'id', messages)
    ).toBe('forbidden');
  });
});
