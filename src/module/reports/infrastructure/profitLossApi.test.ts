import { vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { profitLossApi } from './profitLossApi';
import { ReportRequestError } from './reportRequest';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

const page = (rows: unknown[], pageNumber: number, totalPages: number) => ({
  data: {
    data: {
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      sections: [],
      summary: { totalRevenue: 10 },
      rows,
      pagination: { page: pageNumber, totalPages },
    },
  },
});
const row = (label: string) => ({ type: 'account', account: null, label, amount: 1 });
const period = { startDate: '2026-11-01', endDate: '2026-11-10' };
const opts = { lang: 'id' as const, fallbackMessage: 'gagal' };

describe('profitLossApi.getReport', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('reads every page of lines and joins them in order', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(page([row('a'), row('b')], 1, 2))
      .mockResolvedValueOnce(page([row('c')], 2, 2));
    const report = await profitLossApi.getReport(period, opts);

    expect(report.rows.map((line) => line.label)).toEqual(['a', 'b', 'c']);
    expect(report.summary.totalRevenue).toBe(10);
    expect(apiClient.get).toHaveBeenCalledTimes(2);
    expect(vi.mocked(apiClient.get).mock.calls[1][1]).toMatchObject({
      params: { startDate: '2026-11-01', endDate: '2026-11-10', lang: 'id', page: 2, limit: 500 },
    });
  });

  it('asks once when everything fits on one page', async () => {
    vi.mocked(apiClient.get).mockResolvedValue(page([row('a')], 1, 1));
    await profitLossApi.getReport(period, opts);
    expect(apiClient.get).toHaveBeenCalledTimes(1);
  });

  it('shows the server message of a failed request, or the fallback', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: { status: 403, data: { message: 'Forbidden Access Role' } },
      })
    );
    await expect(profitLossApi.getReport(period, opts)).rejects.toThrow('Forbidden Access Role');

    vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('network'));
    await expect(profitLossApi.getReport(period, opts)).rejects.toThrow('gagal');
  });
});

describe('profitLossApi errors', () => {
  it('carries the status of a refusal, so the screen can tell 400 and 403 from a fault', async () => {
    vi.mocked(apiClient.get).mockRejectedValueOnce(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: { status: 403, data: { message: 'Forbidden Access Role' } },
      })
    );
    const error = await profitLossApi.getReport(period, opts).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ReportRequestError);
    expect((error as ReportRequestError).status).toBe(403);
  });

  it('sends the language with an export too', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: new Blob(['x']), headers: {} });
    await profitLossApi.exportReport(period, 'xlsx', { ...opts, lang: 'en' });
    expect(vi.mocked(apiClient.get).mock.calls.at(-1)?.[1]).toMatchObject({
      params: { lang: 'en' },
    });
  });
});

describe('profitLossApi.exportReport', () => {
  it('asks for the format and names the file from the server', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: new Blob(['x']),
      headers: {
        'content-disposition': 'attachment; filename="profit-loss-20261101-20261110.pdf"',
      },
    });
    const result = await profitLossApi.exportReport(period, 'pdf', opts);

    expect(vi.mocked(apiClient.get).mock.calls.at(-1)?.[0]).toBe(
      '/v1/reports/profit-loss/export/pdf'
    );
    expect(result.filename).toBe('profit-loss-20261101-20261110.pdf');
  });

  it('falls back to a name built from the dates', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: new Blob(['x']), headers: {} });
    const result = await profitLossApi.exportReport(period, 'csv', opts);
    expect(result.filename).toBe('profit-loss-20261101-20261110.csv');
  });
});
