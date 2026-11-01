import { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  contactKeys,
  useArchiveContact,
  useCreateContactGroup,
  useDeleteContactGroup,
  useImportContacts,
  useSaveContact,
  useUpdateContactGroup,
} from './useContactQueries';

const api = vi.hoisted(() => ({
  createContact: vi.fn(),
  updateContact: vi.fn(),
  archiveContact: vi.fn(),
  createContactGroup: vi.fn(),
  updateContactGroup: vi.fn(),
  deleteContactGroup: vi.fn(),
  importContacts: vi.fn(),
}));
const notify = vi.hoisted(() => vi.fn());

vi.mock('@/module/contacts/infrastructure/contactApi', async () => {
  const actual = await vi.importActual<object>('@/module/contacts/infrastructure/contactApi');
  return { ...actual, ...api };
});
vi.mock('@mantine/notifications', () => ({ notifications: { show: notify } }));

let queryClient: QueryClient;
const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

beforeEach(() => {
  Object.values(api).forEach((fn) => fn.mockReset());
  notify.mockReset();
  queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
});

describe('contactKeys', () => {
  it('scopes every key under the contacts root so one invalidation covers them', () => {
    expect(contactKeys.list({ page: 1 } as never)[0]).toBe(contactKeys.all[0]);
    expect(contactKeys.detail('a')).toEqual(['contacts', 'detail', 'a']);
    expect(contactKeys.groups.slice(0, 1)).toEqual(contactKeys.all);
    expect(contactKeys.transactions('a')[1]).toBe('transactions');
  });
});

describe('contact mutations', () => {
  it('creates when there is no editing id and invalidates the whole contacts tree', async () => {
    api.createContact.mockResolvedValue({ displayName: 'PT A' });
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSaveContact(), { wrapper });

    await act(() => result.current.mutateAsync({ displayName: 'x' } as never));

    expect(api.createContact).toHaveBeenCalledTimes(1);
    expect(api.updateContact).not.toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ queryKey: contactKeys.all });
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ color: 'teal' }));
  });

  it('updates the given id and reports a server error message without invalidating', async () => {
    const error = Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { data: { message: 'Nomor sudah dipakai' } },
    });
    api.updateContact.mockRejectedValue(error);
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSaveContact('c-1'), { wrapper });

    await act(async () => {
      await result.current.mutateAsync({ displayName: 'x' } as never).catch(() => undefined);
    });

    expect(api.updateContact).toHaveBeenCalledWith('c-1', { displayName: 'x' });
    expect(spy).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(
        expect.objectContaining({ color: 'red', message: 'Nomor sudah dipakai' })
      )
    );
  });

  it('archive and import invalidate contacts; import counts default to 0', async () => {
    api.archiveContact.mockResolvedValue({ displayName: 'PT A' });
    api.importContacts.mockResolvedValue({});
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const archive = renderHook(() => useArchiveContact(), { wrapper });
    const imp = renderHook(() => useImportContacts(), { wrapper });

    await act(() => archive.result.current.mutateAsync('c-1'));
    await act(() => imp.result.current.mutateAsync(new File([''], 'a.xlsx')));

    expect(api.archiveContact).toHaveBeenCalledWith('c-1');
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith({ queryKey: contactKeys.all });
  });
});

describe('contact group mutations', () => {
  it('invalidate only the groups key and pass the right arguments', async () => {
    api.createContactGroup.mockResolvedValue({});
    api.updateContactGroup.mockResolvedValue({});
    api.deleteContactGroup.mockResolvedValue({});
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const create = renderHook(() => useCreateContactGroup(), { wrapper });
    const update = renderHook(() => useUpdateContactGroup(), { wrapper });
    const remove = renderHook(() => useDeleteContactGroup(), { wrapper });

    await act(() => create.result.current.mutateAsync('VIP'));
    await act(() => update.result.current.mutateAsync({ groupId: 'g1', name: 'Gold' }));
    await act(() => remove.result.current.mutateAsync('g1'));

    expect(api.createContactGroup).toHaveBeenCalledWith('VIP');
    expect(api.updateContactGroup).toHaveBeenCalledWith('g1', 'Gold');
    expect(api.deleteContactGroup).toHaveBeenCalledWith('g1');
    expect(spy).toHaveBeenCalledTimes(3);
    spy.mock.calls.forEach(([filters]) =>
      expect(filters).toEqual({ queryKey: contactKeys.groups })
    );
  });

  it('shows the fallback error and does not invalidate when a group call fails', async () => {
    api.deleteContactGroup.mockRejectedValue(new Error('boom'));
    const spy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useDeleteContactGroup(), { wrapper });

    await act(async () => {
      await result.current.mutateAsync('g1').catch(() => undefined);
    });

    expect(spy).not.toHaveBeenCalled();
    await waitFor(() =>
      expect(notify).toHaveBeenCalledWith(expect.objectContaining({ color: 'red' }))
    );
  });
});
