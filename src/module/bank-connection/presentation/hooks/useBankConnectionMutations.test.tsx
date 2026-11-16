import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSaveConnection } from '@/module/bank-connection/presentation/hooks/useBankConnectionMutations';

const api = vi.hoisted(() => ({
  createConnection: vi.fn(),
  updateConnection: vi.fn(),
  submitConnection: vi.fn(),
  uploadDocument: vi.fn(),
}));
vi.mock('@/module/bank-connection/infrastructure/bankConnectionApi', () => ({
  ...api,
  cancelConnection: vi.fn(),
  proposeBank: vi.fn(),
  revokeConnection: vi.fn(),
  signConnection: vi.fn(),
  syncConnection: vi.fn(),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const body = { providerId: 'p', accountId: 'a' } as never;
const ktp = new File(['k'], 'ktp.pdf', { type: 'application/pdf' });
const proof = new File(['p'], 'buku.pdf', { type: 'application/pdf' });

describe('useSaveConnection', () => {
  beforeEach(() => {
    Object.values(api).forEach((fn) => fn.mockReset());
    api.createConnection.mockResolvedValue({ id: 'bc_1' });
    api.updateConnection.mockResolvedValue({ id: 'bc_1' });
    api.submitConnection.mockResolvedValue({ id: 'bc_1', status: 'IN_REVIEW' });
    api.uploadDocument.mockResolvedValue(undefined);
  });

  it('saves, then uploads each document to the saved request, then sends it for review', async () => {
    const order: string[] = [];
    api.createConnection.mockImplementation(async () => {
      order.push('create');
      return { id: 'bc_1' };
    });
    api.uploadDocument.mockImplementation(async (_id: string, type: string) => {
      order.push(`upload:${type}`);
    });
    api.submitConnection.mockImplementation(async () => {
      order.push('submit');
      return { id: 'bc_1' };
    });
    const { result } = renderHook(() => useSaveConnection(), { wrapper });

    act(() =>
      result.current.mutate({
        body,
        submit: true,
        documents: { IDENTITY: ktp, ACCOUNT_PROOF: proof },
      })
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(order).toEqual(['create', 'upload:IDENTITY', 'upload:ACCOUNT_PROOF', 'submit']);
    expect(api.uploadDocument).toHaveBeenCalledWith('bc_1', 'IDENTITY', ktp);
  });

  it('uploads nothing when no document was chosen, and does not send a draft for review', async () => {
    const { result } = renderHook(() => useSaveConnection(), { wrapper });
    act(() => result.current.mutate({ body, submit: false }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.uploadDocument).not.toHaveBeenCalled();
    expect(api.submitConnection).not.toHaveBeenCalled();
  });

  it('updates the draft it already saved instead of creating another one', async () => {
    const { result } = renderHook(() => useSaveConnection(), { wrapper });
    act(() => result.current.mutate({ id: 'bc_1', body, submit: true }));
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(api.updateConnection).toHaveBeenCalledWith('bc_1', body);
    expect(api.createConnection).not.toHaveBeenCalled();
  });

  it('when an upload fails, keeps the saved request id so a retry does not duplicate it, and does not submit', async () => {
    api.uploadDocument.mockRejectedValue({ kind: 'refused' });
    const { result } = renderHook(() => useSaveConnection(), { wrapper });
    act(() => result.current.mutate({ body, submit: true, documents: { IDENTITY: ktp } }));
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect((result.current.error as unknown as { savedId?: string }).savedId).toBe('bc_1');
    expect(api.submitConnection).not.toHaveBeenCalled();
  });
});
