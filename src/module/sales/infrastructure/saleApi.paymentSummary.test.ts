import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { fetchSalePaymentSummary } from './saleApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

describe('fetchSalePaymentSummary', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('maps the three figures', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: {
          thisMonth: { amount: 520000, count: 4, monthStart: '2026-10-31T17:00:00.000Z' },
          total: { amount: 62025000, count: 242 },
          withholding: 0,
          precision: 2,
        },
      },
    });
    expect(await fetchSalePaymentSummary()).toEqual({
      thisMonth: { amount: 520000, count: 4 },
      total: { amount: 62025000, count: 242 },
      withholding: 0,
    });
    expect(apiClient.get).toHaveBeenCalledWith('/v1/sale-payments/summary');
  });

  it('falls back to zeros when the answer is empty', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: { data: {} } });
    expect(await fetchSalePaymentSummary()).toEqual({
      thisMonth: { amount: 0, count: 0 },
      total: { amount: 0, count: 0 },
      withholding: 0,
    });
  });
});
