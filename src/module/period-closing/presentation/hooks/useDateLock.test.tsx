import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDateLock } from './useDateLock';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

describe('useDateLock', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('names the period that locks the day', async () => {
    http.get.mockResolvedValue({
      data: {
        data: {
          isLocked: true,
          period: {
            id: 'p1',
            name: 'QA Kunci Uji',
            type: 'LOCK',
            startDate: '2025-01-01T00:00:00.000Z',
            endDate: '2025-02-28T00:00:00.000Z',
            isActive: true,
          },
        },
      },
    });
    const { result } = renderHook(() => useDateLock('2025-01-15'), { wrapper });

    await waitFor(() => expect(result.current.isLocked).toBe(true));
    expect(result.current.periodName).toBe('QA Kunci Uji');
    expect(result.current.range).toEqual({ startDate: '2025-01-01', endDate: '2025-02-28' });
    expect(http.get).toHaveBeenCalledWith('/v1/accounting-periods/check', {
      params: { date: '2025-01-15' },
    });
  });

  it('counts the day as open while loading, without a date, and when the check fails', async () => {
    const empty = renderHook(() => useDateLock(null), { wrapper });
    expect(empty.result.current.isLocked).toBe(false);
    expect(http.get).not.toHaveBeenCalled();

    http.get.mockRejectedValue(new Error('network'));
    const failed = renderHook(() => useDateLock('2025-01-15'), { wrapper });
    await waitFor(() => expect(failed.result.current.isLoading).toBe(false));
    expect(failed.result.current.isLocked).toBe(false);
  });
});
