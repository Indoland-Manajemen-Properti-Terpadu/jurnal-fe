import { ReactNode } from 'react';
import { vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { getBankStatement } from './useBankStatement';

vi.mock('@/lib/http/apiClient', () => ({ get: vi.fn() }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
);

const load = async (response: unknown) => {
  vi.mocked(get).mockResolvedValue(response);
  const { result } = renderHook(() => getBankStatement('acc-1'), { wrapper });
  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  return result.current.data?.results;
};

describe('bank statement list mapping', () => {
  it('puts a positive amount on the received side (debit) only', async () => {
    const rows = await load({ data: { results: [{ id: '1', amount: 150000.5 }] } });
    expect(rows?.[0]).toMatchObject({ debit: 150000.5, credit: 0 });
  });

  it('puts a negative amount on the spent side (credit) as a positive number', async () => {
    const rows = await load({ data: { results: [{ id: '1', amount: -2500.75 }] } });
    expect(rows?.[0]).toMatchObject({ debit: 0, credit: 2500.75 });
  });

  it('puts a zero or missing amount on neither side', async () => {
    const rows = await load({ data: { results: [{ id: '1', amount: 0 }, { id: '2' }] } });
    expect(rows?.map((r) => [r.debit, r.credit])).toEqual([
      [0, 0],
      [0, 0],
    ]);
  });

  it('maps name, date and reconciled flag with their fallbacks', async () => {
    const rows = await load({
      data: {
        results: [
          { id: '1', description: 'Setoran', date: '2026-01-02', amount: 1, isReconciled: true },
          { id: '2', transactionName: 'Biaya', transactionDate: '2026-01-03', amount: -1, reconciled: false },
        ],
      },
    });
    expect(rows?.[0]).toMatchObject({
      transactionName: 'Setoran',
      transactionDate: '2026-01-02',
      reconciled: true,
    });
    expect(rows?.[1]).toMatchObject({
      transactionName: 'Biaya',
      transactionDate: '2026-01-03',
      reconciled: false,
    });
  });

  it.each([
    ['data.results', { data: { results: [{ id: 'a' }] } }],
    ['data.resultTransaction', { data: { resultTransaction: [{ id: 'a' }] } }],
    ['results', { results: [{ id: 'a' }] }],
    ['data array', { data: [{ id: 'a' }] }],
    ['bare array', [{ id: 'a' }]],
  ])('reads rows from %s', async (_name, response) => {
    const rows = await load(response);
    expect(rows).toHaveLength(1);
    expect(rows?.[0].id).toBe('a');
  });

  it('returns an empty list for an unknown shape', async () => {
    expect(await load({ foo: 1 })).toEqual([]);
  });
});
