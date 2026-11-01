import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import { ProfilePage } from '@/module/profile';

const { getMock, patchMock, postMock, showMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  postMock: vi.fn(),
  showMock: vi.fn(),
}));

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@mantine/notifications', () => ({ notifications: { show: showMock } }));

vi.mock('@/lib/http/apiClient', () => ({
  default: {
    get: async (url: string) => ({ data: await getMock(url) }),
    patch: async (url: string, body: unknown) => ({ data: await patchMock(url, body) }),
    post: async (url: string, body: unknown) => ({ data: await postMock(url, body) }),
  },
}));

const user = {
  id: 'user-1',
  name: 'Budi Santoso',
  email: 'budi@example.com',
  role: 'user',
  isActive: true,
  isEmailVerified: true,
  accessRole: [{ id: 'r1', name: 'Kasir', description: 'Mengelola penjualan\nDan kas' }],
  site: { id: 'site-1', name: 'Site Jakarta', external_site_id: '991276' },
  createdAt: '2026-03-15T12:00:00.000Z',
  updatedAt: '2026-04-20T12:00:00.000Z',
};

const rights = (extra: Record<string, boolean | string> = {}) => ({
  menuId: 'JP-SALES',
  name: 'Sales',
  read: true,
  create: false,
  update: false,
  delete: false,
  ...extra,
});

const serve = (profile: object = user, permissions: object[] = [rights()], role = 'user') =>
  getMock.mockImplementation(async (url: string) => {
    if (url.endsWith('/permissions')) return { role, permissions };
    return profile;
  });

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ProfilePage />
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('<ProfilePage />', () => {
  beforeEach(() => {
    serve();
    patchMock.mockReset().mockResolvedValue({});
    postMock.mockReset().mockResolvedValue('');
    showMock.mockClear();
  });
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('shows who the user is: name, email, status, role, site and dates', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: 'Budi Santoso' })).toBeInTheDocument();
    expect(screen.getByText('budi@example.com')).toBeInTheDocument();
    expect(screen.getByText('Akun aktif')).toBeInTheDocument();
    expect(screen.getByText('Email terverifikasi')).toBeInTheDocument();
    expect(screen.getByText('Kasir')).toBeInTheDocument();
    expect(screen.getAllByText('Site Jakarta').length).toBeGreaterThan(0);
    expect(screen.getByText('15 Maret 2026')).toBeInTheDocument();
  });

  it('follows the language for dates and labels', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });

    act(() => useI18nStore.getState().setLanguage('en'));

    expect(await screen.findByText('March 15, 2026')).toBeInTheDocument();
    expect(screen.getByText('Account active')).toBeInTheDocument();
  });

  it('keeps name and email read-only for someone who cannot manage users', async () => {
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });

    expect(screen.getByLabelText('Nama lengkap')).toHaveAttribute('readonly');
    expect(screen.getByText(/hanya dapat diubah oleh administrator/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Simpan Perubahan' })).toBeNull();
  });

  it('lets someone who may update users edit, with save off until something changes', async () => {
    serve(user, [rights({ menuId: 'JP-SETT-UM', name: 'User Management', update: true })]);
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    const save = await screen.findByRole('button', { name: 'Simpan Perubahan' });
    expect(save).toBeDisabled();

    const name = screen.getByLabelText(/Nama lengkap/);
    await actor.clear(name);
    await actor.type(name, '  Budi S  ');
    expect(save).toBeEnabled();
    await actor.click(save);

    await waitFor(() => expect(patchMock).toHaveBeenCalledTimes(1));
    expect(patchMock).toHaveBeenCalledWith('/v1/users/user-1', {
      name: 'Budi S',
      email: 'budi@example.com',
    });
    expect(showMock).toHaveBeenCalledWith(expect.objectContaining({ color: 'teal' }));
  });

  it('changes the password with the current one and signs out afterwards', async () => {
    localStorage.setItem('accessToken', 'token');
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    await actor.click(screen.getByRole('tab', { name: /Keamanan/ }));

    const submit = screen.getByRole('button', { name: 'Ganti Kata Sandi' });
    expect(submit).toBeDisabled();
    await actor.type(screen.getByLabelText(/Kata sandi saat ini/), 'lama12345');
    await actor.type(screen.getByLabelText(/^Kata sandi baru/), 'baru12345');
    await actor.type(screen.getByLabelText(/Ulangi kata sandi baru/), 'baru12345');
    expect(submit).toBeEnabled();
    await actor.click(submit);

    await waitFor(() => expect(postMock).toHaveBeenCalledTimes(1));
    expect(postMock).toHaveBeenCalledWith('/v1/users/me/password', {
      currentPassword: 'lama12345',
      newPassword: 'baru12345',
    });
    await waitFor(() => expect(localStorage.getItem('accessToken')).toBeNull());
    expect(showMock).toHaveBeenCalledWith(expect.objectContaining({ color: 'teal' }));
  });

  it('says so next to the field when the current password is wrong', async () => {
    postMock.mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { message: 'Current password is incorrect' } },
    });
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    await actor.click(screen.getByRole('tab', { name: /Keamanan/ }));

    await actor.type(screen.getByLabelText(/Kata sandi saat ini/), 'salah12345');
    await actor.type(screen.getByLabelText(/^Kata sandi baru/), 'baru12345');
    await actor.type(screen.getByLabelText(/Ulangi kata sandi baru/), 'baru12345');
    await actor.click(screen.getByRole('button', { name: 'Ganti Kata Sandi' }));

    expect(await screen.findByText('Kata sandi saat ini tidak cocok.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ganti Kata Sandi' })).toBeEnabled();
  });

  it('lists the menus the user can use and folds the ones without access', async () => {
    serve(user, [
      rights(),
      { ...rights({ read: false }), menuId: 'JP-GL', name: 'General Ledger' },
    ]);
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    await actor.click(screen.getByRole('tab', { name: /Hak Akses/ }));

    expect(await screen.findByText('Anda dapat memakai 1 menu.')).toBeInTheDocument();
    expect(screen.getByText('Sales')).toBeInTheDocument();
    expect(screen.getByText('Menu tanpa akses (1)')).toBeInTheDocument();
  });

  it('tells a superadmin they have full access', async () => {
    serve({ ...user, role: 'superadmin', accessRole: [] }, [rights()], 'superadmin');
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    await actor.click(screen.getByRole('tab', { name: /Hak Akses/ }));

    expect(await screen.findByText(/memiliki akses penuh ke semua menu/)).toBeInTheDocument();
  });

  it('offers a retry when the profile cannot be loaded', async () => {
    getMock.mockRejectedValue(new Error('down'));
    renderPage();

    expect(await screen.findByRole('button', { name: 'Coba lagi' })).toBeInTheDocument();
  });
});
