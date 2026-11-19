import { act, configure, within } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import PaymentTermPage from './PaymentTermPage';

// Dialogs animate in; the whole suite runs many files at once, so give each wait room.
configure({ asyncUtilTimeout: 4000 });

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
}));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));
vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const base = {
  appliesTo: 'both',
  advanceType: 'none',
  billingSplit: 'single',
  hasDueTerm: true,
  hasRetention: false,
  isActive: true,
  summary: {
    paymentLabel: 'Tanpa uang muka',
    billingLabel: 'Sekali tagih',
    dueLabel: '30 hari dari faktur vendor',
  },
};
const used = { ...base, id: 't1', name: 'Net 30', usageCount: 4, canDelete: false };
const free = { ...base, id: 't2', name: 'Uji FE', usageCount: 0, canDelete: true };
const off = {
  ...base,
  id: 't3',
  name: 'Net 60 lama',
  usageCount: 0,
  canDelete: true,
  isActive: false,
};

const page = (total: number, current = 1, limit = 50) => ({
  total,
  page: current,
  limit,
  totalPages: Math.ceil(total / limit),
});

const mockList = (items: unknown[], pagination = page(items.length)) => {
  http.get.mockResolvedValue({ data: { data: { data: items, pagination } } });
};

const httpError = (status: number, message?: string) =>
  Object.assign(new Error('failed'), {
    isAxiosError: true,
    response: { status, data: { message } },
  });

function CurrentPath() {
  const { pathname } = useLocation();
  return <span data-testid="path">{pathname}</span>;
}

const renderPage = (path = '/settings/payment-terms') =>
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/settings/payment-terms" element={<PaymentTermPage />} />
          <Route path="*" element={<CurrentPath />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );

const rowOf = (name: string) => screen.getByText(name).closest('tr') as HTMLElement;

describe('<PaymentTermPage />', () => {
  beforeEach(() => {
    Object.values(http).forEach((fn) => fn.mockReset());
  });
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  describe('list', () => {
    it('shows each term with the labels the API summarises and how many documents use it', async () => {
      mockList([used, free]);
      renderPage();

      expect(await screen.findByText('Net 30')).toBeInTheDocument();
      expect(screen.getAllByText('Tanpa uang muka')).toHaveLength(2);
      expect(screen.getAllByText('Sekali tagih')).toHaveLength(2);
      expect(within(rowOf('Net 30')).getByText('30 hari dari faktur vendor')).toBeInTheDocument();
      expect(within(rowOf('Net 30')).getByText('4 dokumen')).toBeInTheDocument();
      expect(within(rowOf('Uji FE')).getByText('Belum dipakai')).toBeInTheDocument();
    });

    it('asks for the first page without filters', async () => {
      mockList([used]);
      renderPage();
      await screen.findByText('Net 30');

      expect(http.get).toHaveBeenCalledWith('/v1/settings/payment-terms', {
        params: { page: 1 },
      });
    });

    it('keeps an inactive term in the list with an "Nonaktif" badge and its switch off', async () => {
      mockList([free, off]);
      renderPage();
      await screen.findByText('Net 60 lama');

      expect(within(rowOf('Net 60 lama')).getByText('Nonaktif')).toBeInTheDocument();
      expect(screen.getByRole('switch', { name: 'Ubah status Net 60 lama' })).not.toBeChecked();
      expect(screen.getByRole('switch', { name: 'Ubah status Uji FE' })).toBeChecked();
      expect(within(rowOf('Uji FE')).queryByText('Nonaktif')).not.toBeInTheDocument();
    });

    it('sends the filters kept in the address to the API in camelCase', async () => {
      mockList([free]);
      renderPage('/settings/payment-terms?q=uji&appliesTo=service&status=inactive&page=2');
      await screen.findByText('Uji FE');

      await waitFor(() =>
        expect(http.get).toHaveBeenCalledWith('/v1/settings/payment-terms', {
          params: { q: 'uji', appliesTo: 'service', isActive: false, page: 2 },
        })
      );
    });

    it('searches by name while typing', async () => {
      mockList([free]);
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.type(screen.getByPlaceholderText('Cari nama termin...'), 'uji');

      await waitFor(() =>
        expect(http.get).toHaveBeenLastCalledWith('/v1/settings/payment-terms', {
          params: { q: 'uji', page: 1 },
        })
      );
    });

    it('goes to the next page from the footer', async () => {
      mockList([free], page(120));
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');
      expect(screen.getByText('120', { exact: false })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: '2' }));

      await waitFor(() =>
        expect(http.get).toHaveBeenLastCalledWith('/v1/settings/payment-terms', {
          params: { page: 2 },
        })
      );
    });
  });

  describe('states', () => {
    it('invites to create the first term when there is none, and opens the add page', async () => {
      mockList([]);
      const user = userEvent.setup();
      renderPage();

      expect(await screen.findByText('Belum ada termin pembayaran')).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Buat termin pertama' }));

      expect(await screen.findByTestId('path')).toHaveTextContent('/settings/payment-terms/new');
    });

    it('shows no page footer when there are no rows, even if the API still counts one', async () => {
      mockList([], page(1));
      renderPage('/settings/payment-terms?status=inactive');

      expect(await screen.findByText('Termin tidak ditemukan')).toBeInTheDocument();
      expect(screen.queryByText('Menampilkan')).not.toBeInTheDocument();
    });

    it('says nothing matched and lets the filters be cleared', async () => {
      mockList([]);
      const user = userEvent.setup();
      renderPage('/settings/payment-terms?q=zzz');

      expect(await screen.findByText('Termin tidak ditemukan')).toBeInTheDocument();
      mockList([free]);
      await user.click(screen.getByRole('button', { name: 'Atur Ulang Filter' }));

      expect(await screen.findByText('Uji FE')).toBeInTheDocument();
    });

    it('explains when the terms cannot be loaded and tries again on request', async () => {
      http.get.mockRejectedValueOnce(new Error('Network Error'));
      const user = userEvent.setup();
      renderPage();

      expect(await screen.findByText('Termin pembayaran belum bisa dimuat.')).toBeInTheDocument();
      expect(screen.queryByText(/Network Error/)).not.toBeInTheDocument();
      mockList([free]);
      await user.click(screen.getByRole('button', { name: 'Coba Lagi' }));

      expect(await screen.findByText('Uji FE')).toBeInTheDocument();
    });

    it('opens the add page from the header', async () => {
      mockList([free]);
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.click(screen.getByRole('button', { name: 'Tambah Termin' }));

      expect(await screen.findByTestId('path')).toHaveTextContent('/settings/payment-terms/new');
    });

    it('shows the English labels', async () => {
      act(() => useI18nStore.getState().setLanguage('en'));
      mockList([]);
      renderPage();

      expect(await screen.findByText('No payment terms yet')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create the first term' })).toBeInTheDocument();
    });
  });

  describe('actions', () => {
    it('opens the edit page of a term', async () => {
      mockList([free]);
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.click(screen.getByRole('button', { name: 'Ubah termin Uji FE' }));

      expect(await screen.findByTestId('path')).toHaveTextContent(
        '/settings/payment-terms/t2/edit'
      );
    });

    it('switches a term off and on from the table', async () => {
      mockList([free]);
      http.patch.mockResolvedValue({ data: { data: { ...free, isActive: false } } });
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.click(screen.getByRole('switch', { name: 'Ubah status Uji FE' }));

      await waitFor(() =>
        expect(http.patch).toHaveBeenCalledWith('/v1/settings/payment-terms/t2/status', {
          isActive: false,
        })
      );
    });

    it('does not offer to delete a term that documents use, and says why', async () => {
      mockList([used]);
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Net 30');

      const remove = screen.getByRole('button', { name: 'Hapus termin Net 30' });
      expect(remove).toBeDisabled();
      await user.hover(remove.parentElement as HTMLElement);

      expect(
        await screen.findByText('Termin sudah dipakai dokumen, nonaktifkan saja')
      ).toBeInTheDocument();
      expect(http.delete).not.toHaveBeenCalled();
    });

    it('asks to confirm, then deletes the term', async () => {
      mockList([free]);
      http.delete.mockResolvedValue({ data: {} });
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.click(screen.getByRole('button', { name: 'Hapus termin Uji FE' }));
      expect(http.delete).not.toHaveBeenCalled();
      await user.click(await screen.findByRole('button', { name: 'Ya, Hapus' }));

      await waitFor(() =>
        expect(http.delete).toHaveBeenCalledWith('/v1/settings/payment-terms/t2')
      );
    });

    it('does not delete when the confirmation is cancelled', async () => {
      mockList([free]);
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.click(screen.getByRole('button', { name: 'Hapus termin Uji FE' }));
      await user.click(await screen.findByRole('button', { name: 'Batal' }));

      expect(http.delete).not.toHaveBeenCalled();
    });

    it('shows the answer of the API when a term turns out to be in use and offers to deactivate it', async () => {
      mockList([free]);
      http.delete.mockRejectedValue(httpError(409, 'Termin sudah dipakai di 2 dokumen'));
      http.patch.mockResolvedValue({ data: { data: { ...free, isActive: false } } });
      const user = userEvent.setup();
      renderPage();
      await screen.findByText('Uji FE');

      await user.click(screen.getByRole('button', { name: 'Hapus termin Uji FE' }));
      await user.click(await screen.findByRole('button', { name: 'Ya, Hapus' }));

      expect(await screen.findByText('Termin sudah dipakai di 2 dokumen')).toBeInTheDocument();
      expect(screen.getByText('Termin masih dipakai')).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Ya, Hapus' })).not.toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Nonaktifkan' }));

      await waitFor(() =>
        expect(http.patch).toHaveBeenCalledWith('/v1/settings/payment-terms/t2/status', {
          isActive: false,
        })
      );
      await waitFor(() =>
        expect(screen.queryByText('Termin masih dipakai')).not.toBeInTheDocument()
      );
    });
  });
});
