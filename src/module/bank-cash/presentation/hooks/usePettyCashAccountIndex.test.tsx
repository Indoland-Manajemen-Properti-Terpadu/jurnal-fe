import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { usePettyCashAccountIndex } from '@/module/bank-cash/presentation/hooks/usePettyCashAccountIndex';

const funds = vi.hoisted(() => ({ result: {} as Record<string, unknown> }));
vi.mock('@/module/petty-cash', () => ({ usePettyCashFunds: () => funds.result }));

describe('usePettyCashAccountIndex', () => {
  beforeEach(() => {
    funds.result = {};
  });

  it('indexes the accounts of the funds once they load', () => {
    funds.result = {
      isSuccess: true,
      data: {
        items: [
          {
            id: 'f1',
            name: 'Kas Kecil',
            status: 'ACTIVE',
            account: { id: 'a2', name: 'x', accountNumber: '1-10002' },
          },
        ],
      },
    };
    const { result } = renderHook(() => usePettyCashAccountIndex());
    expect(result.current.isReady).toBe(true);
    expect(result.current.index.get('a2')).toEqual({ fundId: 'f1', fundName: 'Kas Kecil' });
  });

  it('gives an empty index while loading and when the request fails', () => {
    funds.result = { isSuccess: false, isError: true, data: undefined };
    const { result } = renderHook(() => usePettyCashAccountIndex());
    expect(result.current.isReady).toBe(false);
    expect(result.current.index.size).toBe(0);
  });
});
