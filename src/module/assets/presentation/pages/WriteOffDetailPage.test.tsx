import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { WriteOffDetailPage } from './WriteOffDetailPage';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:x');
  URL.revokeObjectURL = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
});

const submitter = {
  title: 'Dibuat oleh',
  name: 'Edi Firman Asep Santoso',
  role: 'Pengaju',
  signedAt: '2026-11-17T09:40:23.587Z',
  state: 'signed',
  image: { filePath: 'uploads/sig.png', mimeType: 'image/png' },
};

const pending = {
  id: 'r1',
  number: 'BA/ASET/2026/11/0002',
  asset: 'a1',
  type: 'scrapped',
  status: 'PENDING_APPROVAL',
  incidentDate: '2026-11-10T00:00:00.000Z',
  description: 'Mesin dihapuskan karena sudah tidak layak pakai.',
  attachments: [
    { id: 'f1', filePath: 'uploads/ev.png', fileName: 'ev.png', mimeType: 'image/png' },
  ],
  proceedsAmount: 0,
  snapshot: {
    code: 'ZZ-TEST/009',
    name: 'Mesin Uji',
    acquisitionDate: '2026-10-15T00:00:00.000Z',
    acquisitionCost: 13000000,
    accumulatedDepreciation: 229166.67,
    bookValue: 12770833.33,
    estimatedGainLoss: -12770833.33,
  },
  createdBy: { id: 'u1', name: 'Edi Firman Asep Santoso' },
  submittedAt: '2026-11-17T09:40:23.576Z',
  pendingApprovers: [{ roles: [{ name: 'Chief Finance', approved: false }] }],
  canDecide: true,
  signatures: [
    submitter,
    {
      title: 'Disetujui oleh',
      name: null,
      role: 'Chief Finance',
      signedAt: null,
      state: 'waiting',
    },
  ],
};

const approved = {
  ...pending,
  status: 'APPROVED',
  canDecide: false,
  pendingApprovers: [],
  result: { accumulatedDepreciation: 229166.67, bookValue: 12770833.33, gainLoss: -12770833.33 },
  approvals: [{ at: '2026-11-17T09:42:42.493Z' }],
  signatures: [
    submitter,
    {
      title: 'Disetujui oleh',
      name: 'Raga',
      role: 'Chief Finance',
      signedAt: '2026-11-17T09:42:42.493Z',
      state: 'signed',
    },
  ],
};

const rejected = (reason: string) => ({
  ...pending,
  status: 'REJECTED',
  canDecide: false,
  pendingApprovers: [],
  rejectedAt: '2026-11-17T09:42:31.295Z',
  signatures: [
    submitter,
    {
      title: 'Ditolak oleh',
      name: 'Raga',
      role: 'Penyetuju',
      signedAt: '2026-11-17T09:42:31.295Z',
      state: 'rejected',
      note: reason,
    },
  ],
});

let current: Record<string, unknown> = pending;

const renderPage = (state?: Record<string, unknown>) => {
  http.get.mockImplementation((url: string) =>
    url === '/v1/asset-reports/r1'
      ? Promise.resolve({ data: { data: current } })
      : Promise.reject(new Error(`unexpected ${url}`))
  );
  const router = createMemoryRouter(
    [
      { path: '/assets/write-offs/:id', element: <WriteOffDetailPage /> },
      { path: '*', element: <div>Halaman lain</div> },
    ],
    { initialEntries: [{ pathname: '/assets/write-offs/r1', state }] }
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

const apiError = (message: string, status = 400) =>
  Object.assign(new Error('x'), { isAxiosError: true, response: { status, data: { message } } });

beforeEach(() => {
  http.get.mockReset();
  http.post.mockReset();
  current = pending;
});

describe('WriteOffDetailPage', { timeout: 20_000 }, () => {
  it('offers the decision only to someone who can decide', async () => {
    renderPage();
    expect(
      await screen.findByRole('button', { name: 'Setujui & tandatangani' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tolak' })).toBeInTheDocument();
    expect(screen.getByText(/Berita Acara Pemusnahan Aset/)).toBeInTheDocument();
  });

  it('hides the decision when the user cannot decide', async () => {
    current = { ...pending, canDecide: false };
    renderPage();
    expect(await screen.findByText(/Berita Acara Pemusnahan Aset/)).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Setujui & tandatangani' })
    ).not.toBeInTheDocument();
  });

  it('checks the reason before rejecting, then shows the rejection', async () => {
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Tolak' }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByRole('textbox', { name: /Alasan penolakan/ }), 'ab');
    await user.click(within(dialog).getByRole('button', { name: 'Tolak berita acara' }));
    expect(within(dialog).getByText('Tulis alasannya minimal 3 karakter')).toBeInTheDocument();
    expect(http.post).not.toHaveBeenCalled();

    const reason = 'Akun aset belum benar';
    http.post.mockResolvedValue({ data: { data: rejected(reason) } });
    current = rejected(reason);
    await user.type(
      within(dialog).getByRole('textbox', { name: /Alasan penolakan/ }),
      'c, akun aset belum benar'
    );
    await user.click(within(dialog).getByRole('button', { name: 'Tolak berita acara' }));
    await waitFor(() =>
      expect(http.post).toHaveBeenCalledWith('/v1/asset-reports/r1/reject', {
        reason: 'abc, akun aset belum benar',
      })
    );
    expect(await screen.findByText(reason)).toBeInTheDocument();
    expect(screen.getAllByText('Ditolak').length).toBeGreaterThan(0);
  });

  it('keeps the report waiting when approval fails on the ledger', async () => {
    const message =
      'Akun kas kecil KK-QA (Kas Kecil Test QA Claude) tidak boleh dipakai di jurnal manual. Gunakan menu Kas Kecil.';
    http.post.mockRejectedValue(apiError(message));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Setujui & tandatangani' }));
    const dialog = await screen.findByRole('dialog');
    await user.upload(
      within(dialog).getByLabelText('Unggah gambar'),
      new File(['s'], 'ttd.png', { type: 'image/png' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Setujui & bukukan' }));
    expect(await within(dialog).findByText(message)).toBeInTheDocument();
    expect(
      within(dialog).getByText('Berita acara masih menunggu persetujuan. Tidak ada yang dibukukan.')
    ).toBeInTheDocument();
    expect(http.post.mock.calls[0][0]).toBe('/v1/asset-reports/r1/approve');
    expect(screen.getAllByText('Menunggu persetujuan').length).toBeGreaterThan(0);
  });

  it('shows the booked result and the way to the journal once approved', async () => {
    current = approved;
    renderPage();
    expect(await screen.findByText('Disetujui oleh Raga')).toBeInTheDocument();
    expect(screen.getByText('Angka yang dibukukan saat disetujui.')).toBeInTheDocument();
    expect(screen.queryByText('Perkiraan')).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Aksi lainnya' }));
    expect(await screen.findByRole('menuitem', { name: /Lihat jurnal pelepasan/ })).toHaveAttribute(
      'href',
      '/assets/a1?tab=journals'
    );
    expect(screen.getByText('Ditandatangani secara elektronik')).toBeInTheDocument();
  });

  it('says so when the report does not exist', async () => {
    http.get.mockRejectedValue(apiError('Berita acara tidak ditemukan', 404));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createMemoryRouter(
      [{ path: '/assets/write-offs/:id', element: <WriteOffDetailPage /> }],
      { initialEntries: ['/assets/write-offs/nope'] }
    );
    render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    expect(await screen.findByText('Berita acara tidak ditemukan')).toBeInTheDocument();
  });

  it('marks the figures as an estimate only while the report waits', async () => {
    renderPage();
    expect(await screen.findByText('Perkiraan')).toBeInTheDocument();
    expect(screen.getByText('Perkiraan, angka final dihitung saat disetujui')).toBeInTheDocument();
  });

  it('drops the estimate note and shows the reason once the report is rejected', async () => {
    current = rejected('Akun salah');
    renderPage();
    expect(await screen.findByText('Akun salah')).toBeInTheDocument();
    expect(screen.queryByText('Perkiraan')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Perkiraan, angka final dihitung saat disetujui')
    ).not.toBeInTheDocument();
  });

  it('says the data could not be loaded, with a retry, when the failure is not a missing report', async () => {
    http.get.mockRejectedValue(apiError('boom', 500));
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    const router = createMemoryRouter(
      [{ path: '/assets/write-offs/:id', element: <WriteOffDetailPage /> }],
      { initialEntries: ['/assets/write-offs/r1'] }
    );
    render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );
    expect(
      await screen.findByText('Data belum bisa dimuat. Coba lagi sebentar.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
    expect(screen.queryByText('Berita acara tidak ditemukan')).not.toBeInTheDocument();
  });

  it('keeps the approval dialog open while the request is still running', async () => {
    http.post.mockReturnValue(new Promise(() => {}));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Setujui & tandatangani' }));
    const dialog = await screen.findByRole('dialog');
    await user.upload(
      within(dialog).getByLabelText('Unggah gambar'),
      new File(['s'], 'ttd.png', { type: 'image/png' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Setujui & bukukan' }));
    await waitFor(() => expect(http.post).toHaveBeenCalled());
    await user.keyboard('{Escape}');
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not say nothing was posted when the answer never came', async () => {
    http.post.mockRejectedValue(new Error('Network Error'));
    const user = userEvent.setup();
    renderPage();
    await user.click(await screen.findByRole('button', { name: 'Setujui & tandatangani' }));
    const dialog = await screen.findByRole('dialog');
    await user.upload(
      within(dialog).getByLabelText('Unggah gambar'),
      new File(['s'], 'ttd.png', { type: 'image/png' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Setujui & bukukan' }));
    expect(await within(dialog).findByText('Persetujuan belum berhasil')).toBeInTheDocument();
    expect(
      within(dialog).queryByText(
        'Berita acara masih menunggu persetujuan. Tidak ada yang dibukukan.'
      )
    ).not.toBeInTheDocument();
    expect(within(dialog).getByText(/Periksa status berita acara/)).toBeInTheDocument();
  });
});
