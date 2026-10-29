import type { ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useAddAccount } from './useAddAccount';
import { useUpdateAccount } from './useUpdateAccount';
import { useDeleteAccount } from './useDeleteAccount';
import { useAccountSettings } from './useAccountSettings';

const api = vi.hoisted(() => ({
  createAccount: vi.fn(),
  updateAccount: vi.fn(),
  deleteAccounts: vi.fn(),
}));
const settingsApi = vi.hoisted(() => ({
  downloadAccountImportTemplate: vi.fn(),
  uploadAccountImportFile: vi.fn(),
  commitAccountImport: vi.fn(),
  downloadAccountExport: vi.fn(),
  resetAccountsToDefault: vi.fn(),
}));
const toast = vi.hoisted(() => ({ show: vi.fn() }));
const navigate = vi.hoisted(() => vi.fn());

vi.mock('../../infrastructure/accountApi', () => api);
vi.mock('../../infrastructure/accountSettingApi', () => settingsApi);
vi.mock('@mantine/notifications', () => ({ notifications: toast }));
vi.mock('react-router-dom', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-router-dom')>()),
  useNavigate: () => navigate,
}));

const setup = <T,>(hook: () => T) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(client, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </MemoryRouter>
  );
  return { invalidate, ...renderHook(hook, { wrapper }) };
};

const payload = { name: 'Kas', accountNumber: '1-10001', category: 'c1', isAllUser: true };
const lastToast = () => toast.show.mock.calls.at(-1)?.[0];

describe('account mutations: toasts follow the result (R3)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('add: success toast, list refresh and navigation', async () => {
    api.createAccount.mockResolvedValue({});
    const { result, invalidate } = setup(useAddAccount);

    act(() => result.current.mutate(payload));

    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(lastToast().color).toBe('green');
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['accounts'] });
  });

  it('add: a rejected request shows the server message and does not navigate', async () => {
    api.createAccount.mockRejectedValue({ response: { data: { message: 'Kode sudah dipakai' } } });
    const { result } = setup(useAddAccount);

    act(() => result.current.mutate(payload));

    await waitFor(() => expect(toast.show).toHaveBeenCalled());
    expect(lastToast()).toMatchObject({ color: 'red', message: 'Kode sudah dipakai' });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('update: success refreshes the list and the detail, failure shows an error', async () => {
    api.updateAccount.mockResolvedValueOnce({});
    const { result, invalidate } = setup(() => useUpdateAccount('a1'));

    act(() => result.current.mutate(payload));
    await waitFor(() => expect(navigate).toHaveBeenCalledTimes(1));
    expect(api.updateAccount).toHaveBeenCalledWith('a1', payload);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ['detail_account', 'a1'] });

    api.updateAccount.mockRejectedValueOnce(new Error('network'));
    act(() => result.current.mutate(payload));
    await waitFor(() => expect(lastToast().color).toBe('red'));
    expect(navigate).toHaveBeenCalledTimes(1);
  });

  it('delete: success clears the selection, failure shows an error', async () => {
    api.deleteAccounts.mockResolvedValueOnce({});
    const { result } = setup(useDeleteAccount);

    act(() => result.current.mutate({ accountIds: ['a1'] }));
    await waitFor(() => expect(lastToast().color).toBe('green'));

    api.deleteAccounts.mockRejectedValueOnce({ response: { data: { message: 'Terkunci' } } });
    act(() => result.current.mutate({ accountIds: ['a1'] }));
    await waitFor(() => expect(lastToast()).toMatchObject({ color: 'red', message: 'Terkunci' }));
  });
});

describe('account settings: import, reset and export toasts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('refreshes the account list (real key) after commit and reset, not the dead keys', async () => {
    settingsApi.commitAccountImport.mockResolvedValue({});
    settingsApi.resetAccountsToDefault.mockResolvedValue({});
    const { result, invalidate } = setup(useAccountSettings);

    await act(() => result.current.commitImport({ correctData: [] }));
    await act(() => result.current.resetAccounts());

    const keys = invalidate.mock.calls.map(([filters]) => filters?.queryKey);
    expect(keys).toEqual([['accounts'], ['accounts']]);
  });

  it('shows an error toast when commit, reset or export fail', async () => {
    const error = { response: { data: { message: 'gagal' } } };
    settingsApi.commitAccountImport.mockRejectedValue(error);
    settingsApi.resetAccountsToDefault.mockRejectedValue(error);
    settingsApi.downloadAccountExport.mockRejectedValue(error);
    const { result } = setup(useAccountSettings);

    await act(async () => {
      await result.current.commitImport({ correctData: [] }).catch(() => undefined);
    });
    expect(lastToast()).toMatchObject({ color: 'red', message: 'gagal' });

    toast.show.mockClear();
    await act(async () => {
      await result.current.resetAccounts().catch(() => undefined);
    });
    expect(lastToast()).toMatchObject({ color: 'red', message: 'gagal' });

    toast.show.mockClear();
    act(() => result.current.exportAccounts());
    await waitFor(() => expect(lastToast()).toMatchObject({ color: 'red', message: 'gagal' }));
  });

  it('shows a success toast when the export completes', async () => {
    settingsApi.downloadAccountExport.mockResolvedValue(undefined);
    const { result } = setup(useAccountSettings);

    act(() => result.current.exportAccounts());
    await waitFor(() => expect(lastToast().color).toBe('teal'));
  });
});
