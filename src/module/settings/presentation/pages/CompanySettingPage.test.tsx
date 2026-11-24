import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@test-utils';
import CompanySettingPage from './CompanySettingPage';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
}));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));
vi.mock('@/lib/http/endpoints', () => ({ BASE_URL: 'https://api.example.test' }));
vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const profile = {
  id: 'c1',
  name: 'Demo Site',
  address: 'Jl. Sudirman 1',
  city: 'Jakarta',
  postalCode: '12190',
  npwp: '01.234.567.8-012.000',
  phone: '(021) 5150000',
  email: 'finance@demo.id',
  website: '',
  logo: null,
  updatedAt: '2026-11-24T08:30:00.000Z',
};

const answer = (update: boolean, data = profile) => {
  http.get.mockImplementation(async (url: string) =>
    url === '/v1/users/me/permissions'
      ? {
          data: {
            role: 'user',
            permissions: [{ menuId: 'JP-SETT-COMPANY', read: true, update }],
          },
        }
      : { data: { data } }
  );
};

const renderPage = () => {
  const router = createMemoryRouter(
    [{ path: '/settings/company', element: <CompanySettingPage /> }],
    { initialEntries: ['/settings/company'] }
  );
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

const nameField = () => screen.findByRole('textbox', { name: /Nama perusahaan/ });

describe('<CompanySettingPage />', () => {
  beforeEach(() => {
    Object.values(http).forEach((fn) => fn.mockReset());
  });

  it('shows the saved profile and the header it prints', async () => {
    answer(true);
    renderPage();

    expect(await nameField()).toHaveValue('Demo Site');
    expect(screen.getByRole('textbox', { name: /Kota/ })).toHaveValue('Jakarta');
    // The preview writes the address line and the tax and phone line as the document does.
    expect(screen.getByText('Jl. Sudirman 1, Jakarta 12190')).toBeInTheDocument();
    expect(screen.getByText('NPWP 01.234.567.8-012.000 - Telp (021) 5150000')).toBeInTheDocument();
    // The initials box shows in the preview and, with no logo yet, in the logo card too.
    expect(screen.getAllByText('DS')).toHaveLength(2);
  });

  it('keeps Save off until something changes', async () => {
    answer(true);
    renderPage();
    await nameField();

    expect(screen.getByRole('button', { name: 'Simpan perubahan' })).toBeDisabled();
    expect(screen.getByText('Semua perubahan sudah tersimpan.')).toBeInTheDocument();
  });

  it('follows what is typed in the preview, and saves the trimmed text', async () => {
    answer(true);
    http.put.mockResolvedValue({ data: { data: { ...profile, name: 'PT Maju Bersama' } } });
    const user = userEvent.setup();
    renderPage();
    const name = await nameField();

    await user.clear(name);
    await user.type(name, '  PT Maju Bersama ');

    expect(screen.getAllByText('PM')).toHaveLength(2);
    expect(screen.getByText('Ada perubahan yang belum disimpan.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

    await waitFor(() =>
      expect(http.put).toHaveBeenCalledWith(
        '/v1/settings/company-profile',
        expect.objectContaining({ name: 'PT Maju Bersama', city: 'Jakarta', website: '' })
      )
    );
    expect(await screen.findByText('Semua perubahan sudah tersimpan.')).toBeInTheDocument();
  });

  it('will not save without a company name, and says why next to the field', async () => {
    answer(true);
    const user = userEvent.setup();
    renderPage();
    await user.clear(await nameField());

    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

    expect(await screen.findByText('Wajib diisi.')).toBeInTheDocument();
    expect(http.put).not.toHaveBeenCalled();
  });

  it('refuses a wrong email before anything is sent', async () => {
    answer(true);
    const user = userEvent.setup();
    renderPage();
    await nameField();
    const email = screen.getByRole('textbox', { name: /Email/ });

    await user.clear(email);
    await user.type(email, 'bukan-email');
    await user.click(screen.getByRole('button', { name: 'Simpan perubahan' }));

    expect(await screen.findByText('Alamat email belum benar.')).toBeInTheDocument();
    expect(http.put).not.toHaveBeenCalled();
  });

  it('discards what was typed and goes back to the saved text', async () => {
    answer(true);
    const user = userEvent.setup();
    renderPage();
    const name = await nameField();

    await user.type(name, ' Baru');
    await user.click(screen.getByRole('button', { name: 'Batalkan perubahan' }));

    expect(name).toHaveValue('Demo Site');
    expect(screen.getByRole('button', { name: 'Simpan perubahan' })).toBeDisabled();
  });

  it('only shows the profile to someone who may not change it', async () => {
    answer(false);
    renderPage();
    const name = await nameField();

    expect(name).toHaveAttribute('readonly');
    expect(
      await screen.findByText(/Anda hanya dapat melihat profil perusahaan/)
    ).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Simpan perubahan' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Unggah logo' })).not.toBeInTheDocument();
  });

  it('refuses a logo of the wrong kind with the reason, and sends nothing', async () => {
    answer(true);
    const user = userEvent.setup({ applyAccept: false });
    renderPage();
    await nameField();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, new File(['x'], 'logo.svg', { type: 'image/svg+xml' }));

    expect(await screen.findByText('Format logo harus PNG, JPG, atau WEBP.')).toBeInTheDocument();
    expect(http.post).not.toHaveBeenCalled();
  });

  it('sends a good logo as soon as it is chosen', async () => {
    answer(true);
    http.post.mockResolvedValue({
      data: {
        data: {
          ...profile,
          logo: {
            id: 'l1',
            fileName: 'logo.png',
            filePath: 'uploads/logo.png',
            mimeType: 'image/png',
          },
        },
      },
    });
    const user = userEvent.setup({ applyAccept: false });
    renderPage();
    await nameField();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;

    await user.upload(input, new File(['x'], 'logo.png', { type: 'image/png' }));

    await waitFor(() => expect(http.post).toHaveBeenCalled());
    expect(http.post.mock.calls[0][0]).toBe('/v1/settings/company-profile/logo');
    // The preview now shows the picture from the API host instead of the initials box.
    const picture = await screen.findAllByRole('img', { name: 'Logo Demo Site' });
    expect(picture[0]).toHaveAttribute('src', 'https://api.example.test/uploads/logo.png');
  });

  it('says so, with a way to try again, when the profile cannot be loaded', async () => {
    http.get.mockRejectedValue(Object.assign(new Error('x'), { isAxiosError: true }));
    renderPage();

    expect(await screen.findByText('Profil perusahaan belum bisa dimuat.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});
