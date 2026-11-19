import { beforeEach, describe, expect, it, vi } from 'vitest';
import apiClient from '@/lib/http/apiClient';
import { emptyBulkForm } from '../domain/saleBulk';
import { createBulkRecurring } from './saleBulkApi';

vi.mock('@/lib/http/apiClient', () => ({ default: { post: vi.fn() } }));

describe('createBulkRecurring', () => {
  beforeEach(() => {
    vi.mocked(apiClient.post).mockReset();
  });

  it('posts the form and maps the summary and one row per customer', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        data: {
          summary: { created: 1, skipped: 1, failed: 1 },
          results: [
            {
              customer: 'a',
              name: 'A',
              status: 'created',
              saleId: 's1',
              transactionNumber: 'INV-1',
            },
            {
              customer: 'b',
              name: 'B',
              status: 'skipped',
              message: 'Sudah ditagih untuk periode 2026-12',
            },
            { customer: 'c', name: 'C', status: 'weird', message: 'Pelanggan tidak ditemukan' },
          ],
        },
      },
    });
    const values = { ...emptyBulkForm('2026-11-19'), product: 'p', customers: ['a', 'b', 'c'] };
    const outcome = await createBulkRecurring(values);

    expect(apiClient.post).toHaveBeenCalledWith('/v1/sales/bulk-recurring', {
      product: 'p',
      period: '2026-11',
      transactionDate: '2026-11-19',
      dueDate: '2026-11-19',
      unitPrice: 0,
      customers: ['a', 'b', 'c'],
    });
    expect(outcome).toMatchObject({ created: 1, skipped: 1, failed: 1 });
    expect(outcome.rows[0]).toMatchObject({
      status: 'created',
      saleId: 's1',
      transactionNumber: 'INV-1',
    });
    expect(outcome.rows[1]).toMatchObject({ status: 'skipped', saleId: null });
    expect(outcome.rows[2].status).toBe('failed');
  });
});
