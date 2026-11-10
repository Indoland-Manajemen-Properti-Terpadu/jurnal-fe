import { vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { ReportRequestError } from './reportRequest';
import { trialBalanceApi } from './trialBalanceApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const row = (number: string) => ({ account: { id: number, accountNumber: number, name: number } });
const page = (accounts: unknown[], pageNumber: number, totalPages: number, debit = 10) => ({
  data: {
    data: {
      startDate: '2026-11-01',
      endDate: '2026-11-10',
      accounts,
      totals: { closing: { debit, credit: debit } },
      pagination: { page: pageNumber, limit: 100, totalRows: 3, totalPages },
    },
  },
});
const period = { startDate: '2026-11-01', endDate: '2026-11-10' };
const opts = { lang: 'id' as const, fallbackMessage: 'gagal' };
const axiosError = (status: number, data: unknown) =>
  Object.assign(new Error('x'), { isAxiosError: true, response: { status, data } });

beforeEach(() => get.mockReset());

describe('trialBalanceApi.getReport', () => {
  it('reads every page, joins the accounts and keeps the totals of the first page', async () => {
    get
      .mockResolvedValueOnce(page([row('1'), row('2')], 1, 2, 10))
      .mockResolvedValueOnce(page([row('3')], 2, 2, 99));
    const report = await trialBalanceApi.getReport(period, opts);

    expect(report.accounts.map((a) => a.accountNumber)).toEqual(['1', '2', '3']);
    expect(report.totals.closing.debit).toBe(10);
    expect(get).toHaveBeenCalledTimes(2);
  });

  it('sends the dates, language, page and the 100 limit', async () => {
    get.mockResolvedValue(page([row('1')], 1, 1));
    await trialBalanceApi.getReport(period, { ...opts, lang: 'en' });
    expect(get.mock.calls[0][0]).toBe('/v1/reports/trial-balance');
    expect(get.mock.calls[0][1]).toMatchObject({
      params: { startDate: '2026-11-01', endDate: '2026-11-10', lang: 'en', page: 1, limit: 100 },
    });
  });

  it('carries the status of a refusal and the server message, or the fallback', async () => {
    get.mockRejectedValueOnce(axiosError(403, { message: 'Forbidden Access Role' }));
    const error = await trialBalanceApi.getReport(period, opts).catch((e: unknown) => e);
    expect(error).toBeInstanceOf(ReportRequestError);
    expect((error as ReportRequestError).status).toBe(403);
    expect((error as ReportRequestError).message).toBe('Forbidden Access Role');

    get.mockRejectedValueOnce(new Error('network'));
    await expect(trialBalanceApi.getReport(period, opts)).rejects.toThrow('gagal');
  });
});

describe('trialBalanceApi.exportReport', () => {
  it('takes the file name from Content-Disposition', async () => {
    const blob = new Blob(['x']);
    get.mockResolvedValueOnce({
      data: blob,
      headers: {
        'content-disposition': 'attachment; filename="trial-balance-20261101-20261110.pdf"',
      },
    });
    const result = await trialBalanceApi.exportReport(period, 'pdf', opts);
    expect(result.filename).toBe('trial-balance-20261101-20261110.pdf');
    expect(get.mock.calls[0][0]).toBe('/v1/reports/trial-balance/export/pdf');
    expect(get.mock.calls[0][1]).toMatchObject({ responseType: 'blob' });
  });

  it('falls back to a name built from the dates', async () => {
    get.mockResolvedValueOnce({ data: new Blob(['x']), headers: {} });
    const result = await trialBalanceApi.exportReport(period, 'csv', opts);
    expect(result.filename).toBe('trial-balance-20261101-20261110.csv');
  });

  it('reads the message and status of a failed download from the blob', async () => {
    const blob = new Blob([JSON.stringify({ message: 'Rentang waktu maksimal adalah 1 tahun' })]);
    get.mockRejectedValueOnce(axiosError(400, blob));
    const error = await trialBalanceApi.exportReport(period, 'xlsx', opts).catch((e: unknown) => e);
    expect((error as ReportRequestError).status).toBe(400);
    expect((error as ReportRequestError).message).toBe('Rentang waktu maksimal adalah 1 tahun');
  });
});
