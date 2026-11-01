import type { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import {
  KEY_TTL_MS,
  resetIdempotencyKeys,
  useIdempotentMutation,
} from '@/module/petty-cash/presentation/hooks/useIdempotentMutation';

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider
    client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}
  >
    {children}
  </QueryClientProvider>
);

const send = async (
  result: { current: { mutateAsync: (v: { n: number }) => Promise<unknown> } },
  variables: { n: number }
) => {
  await act(async () => {
    await result.current.mutateAsync(variables).catch(() => undefined);
  });
};

describe('useIdempotentMutation', () => {
  beforeEach(() => resetIdempotencyKeys());

  it('reuses the key when the connection dropped, so a retry cannot post twice', async () => {
    const keys: string[] = [];
    const fn = vi.fn(async (_v: { n: number }, key: string) => {
      keys.push(key);
      throw new PettyCashError({ kind: 'network' });
    });
    const { result } = renderHook(() => useIdempotentMutation('voucher:create:f1', fn), {
      wrapper,
    });

    await send(result, { n: 1 });
    await send(result, { n: 1 });

    expect(keys).toHaveLength(2);
    expect(keys[1]).toBe(keys[0]);
  });

  it('keeps the key across a remount while the outcome is still unknown', async () => {
    const keys: string[] = [];
    const fn = async (_v: { n: number }, key: string) => {
      keys.push(key);
      throw new PettyCashError({ kind: 'network' });
    };
    const first = renderHook(() => useIdempotentMutation('voucher:create:f1', fn), { wrapper });
    await send(first.result, { n: 1 });
    first.unmount();

    const second = renderHook(() => useIdempotentMutation('voucher:create:f1', fn), { wrapper });
    await send(second.result, { n: 1 });

    expect(keys[1]).toBe(keys[0]);
  });

  it('uses a fresh key after the server answered with an error, since failures are cached per key', async () => {
    const keys: string[] = [];
    const fn = async (_v: { n: number }, key: string) => {
      keys.push(key);
      throw new PettyCashError({ kind: 'domain', code: 'ATTACHMENT_REQUIRED', status: 400 });
    };
    const { result } = renderHook(() => useIdempotentMutation('voucher:create:f1', fn), {
      wrapper,
    });

    await send(result, { n: 1 });
    await send(result, { n: 1 });

    expect(keys[1]).not.toBe(keys[0]);
  });

  it('uses a fresh key after a success, and a new key when the body changes', async () => {
    const keys: string[] = [];
    const fn = async (v: { n: number }, key: string) => {
      keys.push(key);
      if (v.n === 99) throw new PettyCashError({ kind: 'network' });
      return v;
    };
    const { result } = renderHook(() => useIdempotentMutation('voucher:create:f1', fn), {
      wrapper,
    });

    await send(result, { n: 1 });
    await send(result, { n: 1 });
    expect(keys[1]).not.toBe(keys[0]);

    await send(result, { n: 99 });
    await send(result, { n: 100 });
    expect(keys[3]).not.toBe(keys[2]);
  });

  it('runs the caller callbacks too', async () => {
    const onSuccess = vi.fn();
    const onError = vi.fn();
    const { result } = renderHook(
      () =>
        useIdempotentMutation(
          'voucher:submit:v1',
          async (v: { n: number }) => {
            if (v.n === 0) throw new PettyCashError({ kind: 'forbidden' });
            return v;
          },
          { onSuccess, onError }
        ),
      { wrapper }
    );

    await send(result, { n: 1 });
    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    await send(result, { n: 0 });
    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
  });

  it('forgets a key after the time limit, so an identical request much later is a new one', async () => {
    vi.useFakeTimers();
    try {
      const keys: string[] = [];
      const fn = async (_v: { n: number }, key: string) => {
        keys.push(key);
        throw new PettyCashError({ kind: 'network' });
      };
      const { result } = renderHook(() => useIdempotentMutation('voucher:create:f1', fn), {
        wrapper,
      });

      await send(result, { n: 1 });
      vi.advanceTimersByTime(KEY_TTL_MS - 1000);
      await send(result, { n: 1 });
      vi.advanceTimersByTime(KEY_TTL_MS + 1000);
      await send(result, { n: 1 });

      expect(keys[1]).toBe(keys[0]);
      expect(keys[2]).not.toBe(keys[1]);
    } finally {
      vi.useRealTimers();
    }
  });
});
