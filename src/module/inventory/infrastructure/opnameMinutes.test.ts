import { AxiosError } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { ApiError } from '@/lib/http/apiError';
import { downloadOpnameMinutes } from './opnameApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);

const refused = (status: number, body: unknown) =>
  new AxiosError('failed', undefined, undefined, undefined, {
    status,
    data: new Blob([JSON.stringify(body)]),
  } as never);

describe('downloadOpnameMinutes', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('asks the server for the PDF of that count', async () => {
    const pdf = new Blob(['%PDF'], { type: 'application/pdf' });
    get.mockResolvedValue({ data: pdf });

    await expect(downloadOpnameMinutes('o1')).resolves.toBe(pdf);
    expect(get).toHaveBeenCalledWith('/v1/stock/opnames/o1/print', { responseType: 'blob' });
  });

  it('reads the refusal out of the blob so the message survives', async () => {
    get.mockRejectedValue(
      refused(400, { message: 'Berita acara hanya tersedia untuk opname yang sudah diposting' })
    );

    const error = await downloadOpnameMinutes('o1').catch((caught: unknown) => caught);

    expect(error).toBeInstanceOf(ApiError);
    expect((error as ApiError).kind).toBe('domain');
    expect((error as ApiError).serverMessage).toMatch(/sudah diposting/);
  });

  it('keeps a forbidden answer as forbidden', async () => {
    get.mockRejectedValue(refused(403, { message: 'Forbidden Access Role' }));

    const error = await downloadOpnameMinutes('o1').catch((caught: unknown) => caught);

    expect((error as ApiError).kind).toBe('forbidden');
  });
});
