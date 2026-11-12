import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchPeriods, STATUS_FILTER_LIMIT } from './periodApi';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const row = (id: string, isActive: boolean) => ({
  id,
  name: id,
  type: 'LOCK',
  startDate: '2026-01-01T00:00:00.000Z',
  endDate: '2026-01-31T00:00:00.000Z',
  isActive,
});

const answer = (results: unknown[]) => ({
  data: { data: { results, page: 1, limit: 100, totalPages: 1, totalResults: results.length } },
});

describe('fetchPeriods', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('pages on the server when no status is chosen', async () => {
    http.get.mockResolvedValue(answer([row('a', true)]));
    await fetchPeriods({ type: 'LOCK', page: 2, limit: 10 });

    expect(http.get).toHaveBeenCalledWith('/v1/accounting-periods', {
      params: { type: 'LOCK', sortBy: 'startDate:desc', page: 2, limit: 10 },
    });
  });

  it('filters the status itself, since the server filter answers no rows', async () => {
    http.get.mockResolvedValue(
      answer([row('a', true), row('b', false), row('c', true), row('d', true)])
    );
    const page = await fetchPeriods({ status: 'active', page: 2, limit: 2 });

    expect(http.get.mock.calls[0][1].params).toEqual({
      type: undefined,
      sortBy: 'startDate:desc',
      page: 1,
      limit: STATUS_FILTER_LIMIT,
    });
    expect(page.items.map((item) => item.id)).toEqual(['d']);
    expect(page.pagination).toEqual({ page: 2, limit: 2, totalPages: 2, total: 3 });
  });
});
