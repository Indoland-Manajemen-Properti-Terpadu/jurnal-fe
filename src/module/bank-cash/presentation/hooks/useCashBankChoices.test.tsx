import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCashBankChoices } from '@/module/bank-cash/presentation/hooks/useCashBankChoices';

const q = vi.hoisted(() => ({
  cash: {} as Record<string, unknown>,
  all: {} as Record<string, unknown>,
}));
vi.mock('@/module/chart-of-accounts', () => ({
  useSimpleAccounts: (params?: unknown) => (params ? q.cash : q.all),
  useJournalAccounts: () => ({ accounts: [] }),
}));

describe('useCashBankChoices', () => {
  beforeEach(() => {
    q.cash = { accounts: [], isLoading: false, isError: false, isSuccess: true };
    q.all = { accounts: [], isLoading: false, isError: false, isSuccess: true };
  });

  it('is ready once the cash and bank list has loaded', () => {
    expect(renderHook(() => useCashBankChoices()).result.current).toMatchObject({
      ready: true,
      isError: false,
    });
  });

  it('is not ready and reports the failure when the cash and bank list cannot be loaded', () => {
    q.cash = { accounts: [], isLoading: false, isError: true, isSuccess: false };
    expect(renderHook(() => useCashBankChoices()).result.current).toMatchObject({
      ready: false,
      isError: true,
    });
  });
});
