import { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MantineProvider } from '@mantine/core';
import type { Sale } from '@/module/sales/domain/sale';
import { useContactTransactionView } from './useContactTransactionView';

const queryState = vi.hoisted(() => ({ data: undefined as unknown }));

vi.mock('./useContactQueries', () => ({
  useContactTransactions: () => ({ data: queryState.data }),
}));

const wrapper = ({ children }: { children: ReactNode }) => (
  <MantineProvider>{children}</MantineProvider>
);

const past = '2000-01-01T00:00:00.000Z';
const future = '2999-01-01T00:00:00.000Z';

const sale = (id: string, overrides: Partial<Sale>) =>
  ({ id, status: 'DRAFT', remainingAmount: 0, paidAmount: 0, ...overrides }) as Sale;

const sales = [
  sale('draft', { status: 'DRAFT', remainingAmount: 100, dueDate: past }),
  sale('open', { status: 'OPEN', remainingAmount: 100, dueDate: future }),
  sale('partial', { status: 'PARTIAL', remainingAmount: 50, dueDate: past }),
  sale('paid', { status: 'PAID', remainingAmount: 0, paidAmount: 100 }),
  sale('settled', { status: 'SENT', remainingAmount: 0, paidAmount: 10 }),
  sale('sent-owing', { status: 'SENT', remainingAmount: 5 }),
  sale('empty', { status: undefined as never }),
];

const view = (status: Parameters<typeof useContactTransactionView>[2], page = 1, limit = 50) => {
  queryState.data = { items: sales, pagination: { total: sales.length } };
  const { result } = renderHook(() => useContactTransactionView('c-1', '', status, page, limit), {
    wrapper,
  });
  return result.current;
};

const ids = (status: Parameters<typeof useContactTransactionView>[2]) =>
  view(status).items.map((s) => s.id);

describe('useContactTransactionView (characterization)', () => {
  it('returns everything for all', () => {
    expect(ids('all')).toHaveLength(sales.length);
  });

  it('OVERDUE needs a remaining amount and a past due date, drafts included', () => {
    expect(ids('OVERDUE')).toEqual(['draft', 'partial']);
  });

  it('UNPAID covers open states and any non-draft with a balance', () => {
    expect(ids('UNPAID')).toEqual(['open', 'partial', 'sent-owing']);
  });

  it('PAID covers PAID status and settled invoices that received money', () => {
    expect(ids('PAID')).toEqual(['paid', 'settled']);
  });

  it('DRAFT also matches a missing status', () => {
    expect(ids('DRAFT')).toEqual(['draft', 'empty']);
  });

  it('paginates the filtered list and reports counts and the truncation flag', () => {
    const second = view('all', 2, 3);
    expect(second.items.map((s) => s.id)).toEqual(['paid', 'settled', 'sent-owing']);
    expect(second.totalPages).toBe(3);
    expect(second.filteredCount).toBe(7);
    expect(second.isLimited).toBe(false);

    queryState.data = { items: sales, pagination: { total: 500 } };
    const { result } = renderHook(() => useContactTransactionView('c-1', '', 'all', 1, 50), {
      wrapper,
    });
    expect(result.current.isLimited).toBe(true);
  });

  it('keeps at least one page when nothing matches or nothing loaded', () => {
    queryState.data = undefined;
    const { result } = renderHook(() => useContactTransactionView('c-1', '', 'PAID', 1, 10), {
      wrapper,
    });
    expect(result.current.items).toEqual([]);
    expect(result.current.totalPages).toBe(1);
  });
});
