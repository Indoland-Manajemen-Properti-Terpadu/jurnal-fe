import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { fetchSalePaymentTerms } from './saleApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { get: vi.fn() } }));

describe('fetchSalePaymentTerms', () => {
  beforeEach(() => {
    vi.mocked(apiClient.get).mockReset();
  });

  it('reads the options list, which holds active terms only', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: [
          { id: 't1', name: 'Net 30', days: 30, isDefault: true, isActive: true },
          { id: 't2', name: 'Net 15', days: 15, isDefault: false, isActive: true },
        ],
      },
    });
    expect(await fetchSalePaymentTerms()).toEqual([
      { id: 't1', name: 'Net 30', days: 30, isDefault: true },
      { id: 't2', name: 'Net 15', days: 15, isDefault: false },
    ]);
    expect(apiClient.get).toHaveBeenCalledWith('/v1/payment-terms/options');
  });

  it('drops a term flagged inactive even if the list returns it', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        data: [
          { id: 't0', name: 'Cash on Delivery', days: 0, isDefault: true, isActive: false },
          { id: 't1', name: 'Net 30', days: 30, isDefault: false, isActive: true },
        ],
      },
    });
    expect((await fetchSalePaymentTerms()).map((term) => term.id)).toEqual(['t1']);
  });
});
