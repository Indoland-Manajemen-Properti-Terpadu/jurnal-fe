import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import userEvent from '@testing-library/user-event';
import { waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@test-utils';
import { WriteOffFormPage } from './WriteOffFormPage';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

beforeAll(() => {
  URL.createObjectURL = vi.fn(() => 'blob:preview');
  URL.revokeObjectURL = vi.fn();
  HTMLCanvasElement.prototype.getContext = vi.fn(() => null) as never;
});

const asset = {
  id: 'a1',
  code: 'AC/001',
  name: 'AC Split Gree 1 PK',
  categoryName: 'Air Conditioner',
  acquisitionDate: '2026-04-02T00:00:00.000Z',
  acquisitionCost: 4500000,
  residualValue: 0,
  netBookValue: 4500000,
  status: 'active',
  source: 'jurnal',
};

const preview = {
  acquisitionCost: 4500000,
  catchUpDepreciation: 656250,
  accumulatedDepreciation: 656250,
  bookValue: 3843750,
  disposalPrice: 0,
  gainLoss: -3843750,
};

const emptyPage = {
  data: { data: { data: [], pagination: { total: 0, page: 1, limit: 1, totalPages: 0 } } },
};

const mockApi = ({
  assetDto = asset,
  pending = false,
}: { assetDto?: Record<string, unknown>; pending?: boolean } = {}) => {
  http.get.mockImplementation((url: string) => {
    if (url === '/v1/assets/a1') return Promise.resolve({ data: { data: assetDto } });
    if (url === '/v1/assets/a1/dispose-preview') {
      return Promise.resolve({ data: { data: preview } });
    }
    if (url === '/v1/accounts') return Promise.resolve({ data: { results: [] } });
    if (url === '/v1/asset-reports') {
      return Promise.resolve(
        pending
          ? {
              data: {
                data: {
                  data: [
                    {
                      id: 'r1',
                      number: 'BA/ASET/2026/11/0001',
                      asset: 'a1',
                      status: 'PENDING_APPROVAL',
                      type: 'damaged',
                    },
                  ],
                  pagination: { total: 1, page: 1, limit: 1, totalPages: 1 },
                },
              },
            }
          : emptyPage
      );
    }
    return Promise.reject(new Error(`unexpected ${url}`));
  });
};

const renderPage = () => {
  const router = createMemoryRouter(
    [
      { path: '/assets/write-offs/new', element: <WriteOffFormPage /> },
      { path: '/assets/write-offs/:id', element: <div>Halaman berita acara</div> },
      { path: '*', element: <div>Halaman lain</div> },
    ],
    { initialEntries: ['/assets/write-offs/new?asset=a1'] }
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
  return router;
};

const fillForm = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(await screen.findByRole('radio', { name: /Dimusnahkan/ }, { timeout: 5000 }));
  await user.click(screen.getByRole('textbox', { name: /Kronologi/ }));
  await user.paste('Mesin tidak layak pakai, sudah diperiksa teknisi.');
  const dropInput = document.querySelector(
    'input[type="file"]:not([aria-label])'
  ) as HTMLInputElement;
  await user.upload(dropInput, new File(['x'], 'foto.png', { type: 'image/png' }));
  await user.upload(
    screen.getByLabelText('Unggah gambar'),
    new File(['s'], 'ttd.png', { type: 'image/png' })
  );
};

beforeEach(() => {
  http.get.mockReset();
  http.post.mockReset();
});

describe('WriteOffFormPage', { timeout: 20_000 }, () => {
  it('shows the five types and titles the document by the chosen one', async () => {
    mockApi();
    const user = userEvent.setup();
    renderPage();
    expect(await screen.findAllByRole('radio')).toHaveLength(5);
    expect(screen.getByText('Berita Acara Pelepasan Aset')).toBeInTheDocument();
    await user.click(screen.getByRole('radio', { name: /Rusak/ }));
    expect(screen.getByText('Berita Acara Kerusakan Aset')).toBeInTheDocument();
  });

  it('points to the pending report instead of showing the form', async () => {
    mockApi({ pending: true });
    renderPage();
    expect(
      await screen.findByText('Aset ini sudah punya berita acara yang menunggu persetujuan')
    ).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Buka berita acara' })).toHaveAttribute(
      'href',
      '/assets/write-offs/r1'
    );
  });

  it('files the report once everything is in and opens it', async () => {
    mockApi();
    http.post.mockResolvedValue({
      data: {
        data: { id: 'r9', number: 'BA/ASET/2026/11/0009', asset: 'a1', status: 'PENDING_APPROVAL' },
      },
    });
    const user = userEvent.setup();
    const router = renderPage();
    const submit = await screen.findByRole('button', { name: 'Ajukan berita acara' });
    expect(submit).toBeDisabled();
    await fillForm(user);
    await waitFor(() => expect(submit).toBeEnabled());
    await user.click(submit);
    await waitFor(() => expect(router.state.location.pathname).toBe('/assets/write-offs/r9'));
    const [url, form] = http.post.mock.calls[0];
    expect(url).toBe('/v1/asset-reports');
    expect((form as FormData).get('type')).toBe('scrapped');
    expect((form as FormData).getAll('attachments')).toHaveLength(1);
  });

  it('keeps the input and shows the reason when filing fails', async () => {
    mockApi();
    http.post.mockRejectedValue(
      Object.assign(new Error('x'), {
        isAxiosError: true,
        response: {
          data: { message: 'Aset ini sudah punya berita acara yang menunggu persetujuan' },
        },
      })
    );
    const user = userEvent.setup();
    renderPage();
    await fillForm(user);
    await user.click(await screen.findByRole('button', { name: 'Ajukan berita acara' }));
    expect(
      await screen.findByText('Aset ini sudah punya berita acara yang menunggu persetujuan')
    ).toBeInTheDocument();
    // The alert sits far above the button on a long form, so it takes the focus.
    expect(screen.getByRole('alert')).toHaveFocus();
    expect(screen.getByRole('textbox', { name: /Kronologi/ })).toHaveValue(
      'Mesin tidak layak pakai, sudah diperiksa teknisi.'
    );
  });

  it('does not offer "fully depreciated" while the book value is above the residual value', async () => {
    mockApi();
    renderPage();
    await waitFor(() =>
      expect(screen.getByRole('radio', { name: /Habis disusutkan/ })).toBeDisabled()
    );
    expect(
      screen.getByText('Belum bisa dipilih: nilai bukunya masih di atas nilai sisa.')
    ).toBeInTheDocument();
  });

  it('explains why an asset acquired in the future cannot be filed yet', async () => {
    mockApi({ assetDto: { ...asset, acquisitionDate: '2099-01-01T00:00:00.000Z' } });
    renderPage();
    expect(await screen.findByText('Tanggal perolehan aset ini belum lewat')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ajukan berita acara' })).toBeDisabled();
  });
});
