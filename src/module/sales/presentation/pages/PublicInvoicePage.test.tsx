import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Sale } from '../../domain/sale';
import { PublicInvoicePage } from './PublicInvoicePage';

const state = vi.hoisted(() => ({
  value: {} as { isLoading?: boolean; isError?: boolean; error?: unknown; data?: unknown },
}));

vi.mock('../../infrastructure/saleErrors', () => ({
  classifySaleError: (error: unknown) => ({
    kind: (error as { kind?: string } | undefined)?.kind ?? 'unknown',
  }),
}));

vi.mock('../hooks/useSaleQueries', () => ({
  usePublicInvoice: () => ({ ...state.value, refetch: vi.fn() }),
}));

const renderPage = () =>
  render(
    <MantineProvider>
      <MemoryRouter initialEntries={['/invoice/abc']}>
        <Routes>
          <Route path="/invoice/:token" element={<PublicInvoicePage />} />
        </Routes>
      </MemoryRouter>
    </MantineProvider>
  );

const missing = { kind: 'notFound' };

describe('PublicInvoicePage', () => {
  it('shows a calm not-found notice for an unknown link', () => {
    state.value = { isError: true, error: missing };
    renderPage();
    expect(screen.getByText('Faktur tidak ditemukan')).toBeTruthy();
  });

  it('offers a retry when the failure is not a missing invoice', () => {
    state.value = { isError: true, error: new Error('offline') };
    renderPage();
    expect(screen.getByText('Faktur belum dapat dimuat')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Coba Lagi' })).toBeTruthy();
  });

  it('shows the invoice number, customer and totals', () => {
    state.value = {
      data: {
        id: 's1',
        transactionNumber: 'INV-001',
        customer: { id: 'c', displayName: 'AAG0808' },
        displayStatus: { code: 'UNPAID', label: 'Belum Lunas' },
        items: [{ product: { id: 'p', name: 'Jasa' }, quantity: 2, unitPrice: 500, amount: 1000 }],
        subtotal: 1000,
        finalAmount: 1000,
        paidAmount: 0,
        remainingAmount: 1000,
        transactionDate: '2026-11-05T00:00:00.000Z',
        dueDate: '2026-12-05T00:00:00.000Z',
      } as unknown as Sale,
    };
    renderPage();
    expect(screen.getByText('INV-001')).toBeTruthy();
    expect(screen.getByText('AAG0808')).toBeTruthy();
    expect(screen.getByText('Belum Lunas')).toBeTruthy();
  });
});
