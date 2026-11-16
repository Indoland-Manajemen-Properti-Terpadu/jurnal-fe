import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useCompanySite } from '@/module/profile/presentation/hooks/useCompanySite';

const q = vi.hoisted(() => ({ result: {} as Record<string, unknown> }));
vi.mock('@/module/profile/presentation/hooks/useProfileQueries', () => ({
  useGetProfile: () => q.result,
}));

describe('useCompanySite', () => {
  it('gives the name and the code of the site of the signed-in user', () => {
    q.result = {
      data: { site: { id: 's1', name: 'Demo Site', code: '991276' } },
      isLoading: false,
    };
    expect(renderHook(() => useCompanySite()).result.current.site).toEqual({
      id: 's1',
      name: 'Demo Site',
      code: '991276',
    });
  });

  it('gives no site while the profile loads or when the user has none', () => {
    q.result = { data: undefined, isLoading: true };
    expect(renderHook(() => useCompanySite()).result.current.site).toBeUndefined();
    q.result = { data: { site: undefined }, isLoading: false };
    expect(renderHook(() => useCompanySite()).result.current.site).toBeUndefined();
  });
});
