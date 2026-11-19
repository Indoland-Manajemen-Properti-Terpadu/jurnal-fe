import { act, configure } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import PaymentTermFormPage from './PaymentTermFormPage';

// Pages animate in and the whole suite runs many files at once, so give each wait room.
configure({ asyncUtilTimeout: 4000 });

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), put: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const saved = {
  id: 't1',
  name: 'Termin Proyek',
  appliesTo: 'service',
  description: 'Untuk proyek renovasi',
  usageExample: '',
  advanceType: 'partial',
  defaultAdvancePercent: 30,
  billingSplit: 'milestone',
  defaultInstallments: 3,
  advanceOutsideInstallments: true,
  periodUnit: null,
  defaultPeriods: null,
  hasDueTerm: true,
  defaultDueDays: 14,
  dueBasis: 'receipt_date',
  hasRetention: true,
  defaultRetentionPercent: 5,
  defaultMaintenanceMonths: 6,
  isActive: true,
  usageCount: 4,
  canDelete: false,
};

const httpError = (status: number, message?: string) =>
  Object.assign(new Error('failed'), {
    isAxiosError: true,
    response: { status, data: { message } },
  });

const renderPage = (path = '/settings/payment-terms/new') => {
  const router = createMemoryRouter(
    [
      { path: '/settings/payment-terms/new', element: <PaymentTermFormPage /> },
      { path: '/settings/payment-terms/:id/edit', element: <PaymentTermFormPage /> },
      { path: '/settings/payment-terms', element: <div>Daftar termin</div> },
    ],
    { initialEntries: [path] }
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
};

type User = ReturnType<typeof userEvent.setup>;

const fillName = async (user: User, name: string) => {
  await user.click(await screen.findByRole('textbox', { name: /Nama Termin/ }));
  await user.paste(name);
};

const setNumber = async (user: User, label: RegExp | string, value: string) => {
  const input = screen.getByRole('textbox', { name: label });
  await user.clear(input);
  await user.type(input, value);
};

const choose = (user: User, name: string) => user.click(screen.getByRole('radio', { name }));

const plainPayload = {
  appliesTo: 'both',
  advanceType: 'none',
  billingSplit: 'single',
  hasDueTerm: true,
  defaultDueDays: 30,
  dueBasis: 'vendor_invoice_date',
  hasRetention: false,
};

describe('<PaymentTermFormPage />', () => {
  beforeEach(() => {
    Object.values(http).forEach((fn) => fn.mockReset());
  });
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  describe('add', () => {
    it('starts with the fields of a plain term only', async () => {
      renderPage();

      expect(
        await screen.findByRole('heading', { name: 'Tambah Termin Pembayaran' })
      ).toBeVisible();
      expect(screen.getByRole('textbox', { name: /Tenggat \(hari\)/ })).toHaveValue('30');
      expect(screen.queryByRole('textbox', { name: /Uang muka \(%\)/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /Jumlah termin/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('textbox', { name: /Jumlah periode/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('switch', { name: /Ada retensi/ })).not.toBeInTheDocument();
      expect(screen.queryByText(/dipakai \d+ dokumen/i)).not.toBeInTheDocument();
    });

    it('shows the fields of the mechanism that is chosen and hides the others', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByRole('heading', { name: 'Tambah Termin Pembayaran' });

      await choose(user, 'Sebagian');
      expect(screen.getByRole('textbox', { name: /Uang muka \(%\)/ })).toBeVisible();

      await choose(user, 'Beberapa termin');
      expect(screen.getByRole('textbox', { name: /Jumlah termin/ })).toBeVisible();
      expect(screen.getByRole('switch', { name: /Uang muka di luar termin/ })).toBeVisible();
      expect(screen.getByRole('switch', { name: /Ada retensi/ })).toBeVisible();

      await choose(user, 'Berulang');
      expect(screen.getByRole('textbox', { name: /Jumlah periode/ })).toBeVisible();
      expect(screen.queryByRole('textbox', { name: /Jumlah termin/ })).not.toBeInTheDocument();
      expect(screen.queryByRole('switch', { name: /Ada retensi/ })).not.toBeInTheDocument();
      expect(
        screen.queryByRole('switch', { name: /Uang muka di luar termin/ })
      ).not.toBeInTheDocument();

      await choose(user, 'Penuh');
      expect(screen.queryByRole('textbox', { name: /Uang muka \(%\)/ })).not.toBeInTheDocument();
    });

    it('hides the due date fields when the invoice has no due date', async () => {
      const user = userEvent.setup();
      renderPage();
      await screen.findByRole('heading', { name: 'Tambah Termin Pembayaran' });

      await user.click(screen.getByRole('switch', { name: /Faktur punya tenggat/ }));

      expect(screen.queryByRole('textbox', { name: /Tenggat \(hari\)/ })).not.toBeInTheDocument();
    });

    it('asks for a name and sends nothing without it', async () => {
      const user = userEvent.setup();
      renderPage();

      await user.click(await screen.findByRole('button', { name: 'Simpan Termin' }));

      expect(await screen.findByText('Nama termin wajib diisi')).toBeVisible();
      expect(http.post).not.toHaveBeenCalled();
    });

    it('checks only the fields that apply, with the same limits as the API', async () => {
      const user = userEvent.setup();
      renderPage();
      await fillName(user, 'Termin Uji');
      await choose(user, 'Sebagian');
      await choose(user, 'Beberapa termin');
      await setNumber(user, /Jumlah termin/, '1');

      await user.click(screen.getByRole('button', { name: 'Simpan Termin' }));

      expect(await screen.findByText('Uang muka harus antara 1 dan 99 persen')).toBeVisible();
      expect(screen.getByText('Jumlah termin minimal 2')).toBeVisible();
      expect(http.post).not.toHaveBeenCalled();
    });

    it('saves a plain term and returns to the list', async () => {
      http.post.mockResolvedValue({ data: { data: { id: 'new' } } });
      const user = userEvent.setup();
      const router = renderPage();
      await fillName(user, '  Net 14  ');
      await setNumber(user, /Tenggat \(hari\)/, '14');

      await user.click(screen.getByRole('button', { name: 'Simpan Termin' }));

      await waitFor(() =>
        expect(http.post).toHaveBeenCalledWith('/v1/settings/payment-terms', {
          ...plainPayload,
          name: 'Net 14',
          defaultDueDays: 14,
        })
      );
      await waitFor(() => expect(router.state.location.pathname).toBe('/settings/payment-terms'));
      expect(await screen.findByText('Daftar termin')).toBeVisible();
    });

    it('sends a milestone term with partial advance, advance outside the installments and retention', async () => {
      http.post.mockResolvedValue({ data: { data: { id: 'new' } } });
      const user = userEvent.setup();
      renderPage();
      await fillName(user, 'Termin Proyek');
      await choose(user, 'Sebagian');
      await setNumber(user, /Uang muka \(%\)/, '30');
      await choose(user, 'Beberapa termin');
      await setNumber(user, /Jumlah termin/, '3');
      await user.click(screen.getByRole('switch', { name: /Uang muka di luar termin/ }));
      await user.click(screen.getByRole('switch', { name: /Ada retensi/ }));
      await setNumber(user, /Retensi \(%\)/, '5');
      await setNumber(user, /Masa pemeliharaan/, '6');

      await user.click(screen.getByRole('button', { name: 'Simpan Termin' }));

      await waitFor(() =>
        expect(http.post).toHaveBeenCalledWith('/v1/settings/payment-terms', {
          ...plainPayload,
          name: 'Termin Proyek',
          advanceType: 'partial',
          defaultAdvancePercent: 30,
          billingSplit: 'milestone',
          defaultInstallments: 3,
          advanceOutsideInstallments: true,
          hasRetention: true,
          defaultRetentionPercent: 5,
          defaultMaintenanceMonths: 6,
        })
      );
    });

    it('does not send what was filled for a mechanism that was then switched away from', async () => {
      http.post.mockResolvedValue({ data: { data: { id: 'new' } } });
      const user = userEvent.setup();
      renderPage();
      await fillName(user, 'Net 30');
      await choose(user, 'Beberapa termin');
      await setNumber(user, /Jumlah termin/, '3');
      await user.click(screen.getByRole('switch', { name: /Ada retensi/ }));
      await setNumber(user, /Retensi \(%\)/, '5');
      await setNumber(user, /Masa pemeliharaan/, '6');
      await choose(user, 'Sekali tagih');

      await user.click(screen.getByRole('button', { name: 'Simpan Termin' }));

      await waitFor(() =>
        expect(http.post).toHaveBeenCalledWith('/v1/settings/payment-terms', {
          ...plainPayload,
          name: 'Net 30',
        })
      );
    });

    it('keeps the form when the API rejects the term', async () => {
      http.post.mockRejectedValue(httpError(400, 'Nama termin sudah dipakai'));
      const user = userEvent.setup();
      const router = renderPage();
      await fillName(user, 'Net 30');

      await user.click(screen.getByRole('button', { name: 'Simpan Termin' }));

      await waitFor(() => expect(http.post).toHaveBeenCalledTimes(1));
      expect(router.state.location.pathname).toBe('/settings/payment-terms/new');
      expect(screen.getByRole('textbox', { name: /Nama Termin/ })).toHaveValue('Net 30');
      expect(screen.getByRole('button', { name: 'Simpan Termin' })).toBeEnabled();
    });
  });

  describe('leaving', () => {
    it('goes back to the list at once when nothing was entered', async () => {
      const user = userEvent.setup();
      const router = renderPage();

      await user.click(await screen.findByRole('button', { name: 'Batal' }));

      await waitFor(() => expect(router.state.location.pathname).toBe('/settings/payment-terms'));
    });

    it('asks before leaving with unsaved changes', async () => {
      const user = userEvent.setup();
      const router = renderPage();
      await fillName(user, 'Net 30');

      await user.click(screen.getByRole('button', { name: 'Batal' }));

      expect(
        await screen.findByText('Perubahan yang belum disimpan akan hilang.')
      ).toBeInTheDocument();
      expect(router.state.location.pathname).toBe('/settings/payment-terms/new');

      await user.click(screen.getByRole('button', { name: 'Tinggalkan' }));
      await waitFor(() => expect(router.state.location.pathname).toBe('/settings/payment-terms'));
    });

    it('does not ask after the term was saved', async () => {
      http.post.mockResolvedValue({ data: { data: { id: 'new' } } });
      const user = userEvent.setup();
      const router = renderPage();
      await fillName(user, 'Net 30');

      await user.click(screen.getByRole('button', { name: 'Simpan Termin' }));

      await waitFor(() => expect(router.state.location.pathname).toBe('/settings/payment-terms'));
      expect(
        screen.queryByText('Perubahan yang belum disimpan akan hilang.')
      ).not.toBeInTheDocument();
    });
  });

  describe('edit', () => {
    it('fills the form with the saved term and tells how many documents use it', async () => {
      http.get.mockResolvedValue({ data: { data: saved } });
      renderPage('/settings/payment-terms/t1/edit');

      expect(await screen.findByRole('heading', { name: 'Ubah Termin Pembayaran' })).toBeVisible();
      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: /Nama Termin/ })).toHaveValue('Termin Proyek')
      );
      expect(http.get).toHaveBeenCalledWith('/v1/settings/payment-terms/t1');
      expect(screen.getByRole('radio', { name: 'Jasa' })).toBeChecked();
      expect(screen.getByRole('radio', { name: 'Sebagian' })).toBeChecked();
      expect(screen.getByRole('textbox', { name: /Uang muka \(%\)/ })).toHaveValue('30%');
      expect(screen.getByRole('textbox', { name: /Jumlah termin/ })).toHaveValue('3');
      expect(screen.getByRole('switch', { name: /Ada retensi/ })).toBeChecked();
      expect(screen.getByText('Dipakai 4 dokumen.')).toBeVisible();
      expect(
        screen.getByText(
          'Perubahan hanya berlaku untuk penawaran berikutnya, dokumen yang sudah ada tidak berubah.'
        )
      ).toBeVisible();
    });

    it('updates a term that is already in use', async () => {
      http.get.mockResolvedValue({ data: { data: saved } });
      http.put.mockResolvedValue({ data: { data: saved } });
      const user = userEvent.setup();
      const router = renderPage('/settings/payment-terms/t1/edit');
      await waitFor(() =>
        expect(screen.getByRole('textbox', { name: /Nama Termin/ })).toHaveValue('Termin Proyek')
      );
      await setNumber(user, /Jumlah termin/, '4');

      await user.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

      await waitFor(() =>
        expect(http.put).toHaveBeenCalledWith('/v1/settings/payment-terms/t1', {
          name: 'Termin Proyek',
          appliesTo: 'service',
          description: 'Untuk proyek renovasi',
          advanceType: 'partial',
          defaultAdvancePercent: 30,
          billingSplit: 'milestone',
          defaultInstallments: 4,
          advanceOutsideInstallments: true,
          hasDueTerm: true,
          defaultDueDays: 14,
          dueBasis: 'receipt_date',
          hasRetention: true,
          defaultRetentionPercent: 5,
          defaultMaintenanceMonths: 6,
        })
      );
      await waitFor(() => expect(router.state.location.pathname).toBe('/settings/payment-terms'));
    });

    it('says when the term is not found', async () => {
      http.get.mockRejectedValue(httpError(404, 'Payment term not found'));
      renderPage('/settings/payment-terms/zzz/edit');

      expect(await screen.findByText('Termin tidak ditemukan')).toBeVisible();
      expect(screen.queryByText(/Payment term not found/)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Simpan Perubahan' })).not.toBeInTheDocument();
    });
  });

  it('shows the English labels', async () => {
    act(() => useI18nStore.getState().setLanguage('en'));
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Add Payment Term' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save Term' })).toBeVisible();
    expect(screen.getByRole('radio', { name: 'No advance' })).toBeChecked();
  });
});
