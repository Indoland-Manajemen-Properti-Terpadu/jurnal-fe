import { vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { generalLedgerApi } from './generalLedgerApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

const get = vi.mocked(apiClient.get);
const account = (number: string) => ({ id: number, accountNumber: number, accountName: number });
const page = (accounts: unknown[], pageNumber: number, totalPages: number, debit = 10) => ({
  data: {
    data: {
      accounts,
      periodDebitTotal: debit,
      periodCreditTotal: debit,
      pagination: { page: pageNumber, limit: 50, totalAccounts: 3, totalPages },
    },
  },
});
const period = { startDate: '2026-11-01', endDate: '2026-11-10' };

beforeEach(() => {
  get.mockReset();
});

describe('generalLedgerApi.getReport', () => {
  it('asks once when the accounts fit on one page', async () => {
    get.mockResolvedValue(page([account('1'), account('2')], 1, 1));
    const report = await generalLedgerApi.getReport(period);
    expect(get).toHaveBeenCalledTimes(1);
    expect(get.mock.calls[0][1]).toMatchObject({
      params: { startDate: '2026-11-01', endDate: '2026-11-10', page: 1, limit: 50 },
    });
    expect(report.accounts).toHaveLength(2);
  });

  it('reads every page, joins the accounts in order and keeps the totals of the first page', async () => {
    get
      .mockResolvedValueOnce(page([account('1'), account('2')], 1, 2, 10))
      .mockResolvedValueOnce(page([account('3')], 2, 2, 99));
    const report = await generalLedgerApi.getReport(period);
    expect(get).toHaveBeenCalledTimes(2);
    expect(report.accounts.map((item) => item.number)).toEqual(['1', '2', '3']);
    expect(report.periodDebitTotal).toBe(10);
    expect(report.pagination).toMatchObject({ page: 1, totalPages: 1, totalAccounts: 3 });
  });

  it('shows the server message of a failed request', async () => {
    get.mockRejectedValueOnce(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: { status: 400, data: { message: 'Rentang waktu maksimal adalah 1 tahun' } },
      })
    );
    await expect(generalLedgerApi.getReport(period)).rejects.toThrow(
      'Rentang waktu maksimal adalah 1 tahun'
    );
  });
});
