import { describe, expect, it } from 'vitest';
import { toPage } from '@/module/purchases/infrastructure/purchaseMappers';

describe('toPage list summary', () => {
  const page = { page: 1, limit: 10, totalPages: 0, totalResults: 0, results: [] };

  it('keeps an all-zero summary on an empty result page', () => {
    const summary = { total: 0, unpaid: 0, overdue: 0, remainingPayable: 0 };
    expect(toPage({ ...page, summary, precision: 2 }, (item: number) => item)).toMatchObject({
      summary,
      precision: 2,
      items: [],
    });
  });

  it('leaves summary absent when the service omits it', () => {
    expect(toPage({ ...page }, (item: number) => item).summary).toBeUndefined();
  });
});
