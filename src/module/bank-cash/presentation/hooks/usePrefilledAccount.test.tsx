import { MemoryRouter } from 'react-router-dom';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { usePrefilledAccount } from '@/module/bank-cash/presentation/hooks/usePrefilledAccount';

const wrapper =
  (url: string) =>
  ({ children }: { children: React.ReactNode }) => (
    <MemoryRouter initialEntries={[url]}>{children}</MemoryRouter>
  );

const selectable = [{ id: 'a1' }, { id: 'a3' }];

describe('usePrefilledAccount', () => {
  it('selects the account of the URL once the list is ready', () => {
    const { result } = renderHook(() => usePrefilledAccount('toAccountId', selectable, true), {
      wrapper: wrapper('/x?toAccountId=a3'),
    });
    expect(result.current.value).toBe('a3');
    expect(result.current.blocked).toBe(false);
  });

  it('waits for the list so a slow load does not flash the notice', () => {
    const { result } = renderHook(() => usePrefilledAccount('toAccountId', [], false), {
      wrapper: wrapper('/x?toAccountId=a3'),
    });
    expect(result.current).toMatchObject({ value: null, blocked: false });
  });

  it('refuses an account the list does not offer and says so', () => {
    const { result } = renderHook(() => usePrefilledAccount('fromAccountId', selectable, true), {
      wrapper: wrapper('/x?fromAccountId=a2'),
    });
    expect(result.current).toMatchObject({ value: null, blocked: true });
  });

  it('lets the user pick another account afterwards', () => {
    const { result } = renderHook(() => usePrefilledAccount('fromAccountId', selectable, true), {
      wrapper: wrapper('/x?fromAccountId=a2'),
    });
    act(() => result.current.setValue('a1'));
    expect(result.current.value).toBe('a1');
  });
});
