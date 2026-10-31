import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '@/store/useAuthentications';
import { usePettyCashScope } from '@/module/petty-cash/presentation/hooks/usePettyCashScope';
import { pettyCashKeys } from '@/module/petty-cash/presentation/hooks/pettyCashKeys';

const tokenFor = (sub: string) => `h.${btoa(JSON.stringify({ sub })).replace(/=+$/, '')}.s`;

describe('usePettyCashScope', () => {
  afterEach(() => {
    act(() => useAuthStore.getState().clearTokens());
  });

  it('follows the signed-in user, so two users never share petty cash cache keys', () => {
    act(() => useAuthStore.getState().setTokens(tokenFor('user-a'), 'r'));
    const { result } = renderHook(() => usePettyCashScope());
    expect(result.current).toBe('user-a');
    const keyA = pettyCashKeys.fundList(result.current, { limit: 100 });

    act(() => useAuthStore.getState().setTokens(tokenFor('user-b'), 'r'));
    expect(result.current).toBe('user-b');
    expect(pettyCashKeys.fundList(result.current, { limit: 100 })).not.toEqual(keyA);
  });

  it('stays on the same scope when the token is refreshed for the same user', () => {
    act(() => useAuthStore.getState().setTokens(tokenFor('user-a'), 'r'));
    const { result } = renderHook(() => usePettyCashScope());
    const before = result.current;
    act(() => useAuthStore.getState().setTokens(`${tokenFor('user-a')}x`, 'r2'));
    expect(result.current).toBe(before);
  });

  it('uses an anonymous scope when there is no usable token', () => {
    act(() => useAuthStore.getState().clearTokens());
    const { result } = renderHook(() => usePettyCashScope());
    expect(result.current).toBe('anonymous');
  });
});
