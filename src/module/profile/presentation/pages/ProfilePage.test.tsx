import { act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { render, screen, waitFor } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import { ProfilePage } from '@/module/profile';

const { getMock, patchMock, showMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  patchMock: vi.fn(),
  showMock: vi.fn(),
}));

vi.mock('@/components/AppShellLayout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@mantine/notifications', () => ({ notifications: { show: showMock } }));

vi.mock('@/lib/http/apiClient', () => ({
  get: (...args: unknown[]) => getMock(...args),
  patch: (...args: unknown[]) => patchMock(...args),
  default: {
    get: async (...args: unknown[]) => ({ data: await getMock(...args) }),
    patch: async (...args: unknown[]) => ({ data: await patchMock(...args) }),
  },
}));

const user = {
  id: 'user-1',
  name: 'Budi Santoso',
  email: 'budi@example.com',
  role: 'admin',
  accessRole: [],
  isEmailVerified: true,
  site: { id: 'site-1', name: 'Site Jakarta' },
  createdAt: '2026-03-15T12:00:00.000Z',
  updatedAt: '2026-04-20T12:00:00.000Z',
};

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
    getMock.mockReset().mockResolvedValue(user);
    patchMock.mockReset().mockResolvedValue({ code: 200, data: {} });
    showMock.mockClear();
  });
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  it('shows the loading text, then the fetched user in the hero', async () => {
    renderPage();

    expect(screen.getByText('Memuat profil pengguna...')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: 'Budi Santoso' })).toBeInTheDocument();
    expect(screen.getAllByText('Terverifikasi').length).toBeGreaterThan(0);
    expect(screen.getByText('Bergabung: 15 Maret 2026')).toBeInTheDocument();
    expect(screen.getByText('Site: Site Jakarta')).toBeInTheDocument();
    expect(screen.getByText('Aktif & Terverifikasi')).toBeInTheDocument();
  });

  it('keeps save disabled until a field changes, then patches trimmed values', async () => {
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    const save = screen.getByRole('button', { name: 'Simpan Perubahan' });
    expect(save).toBeDisabled();

    const nameInput = screen.getByLabelText(/Nama Lengkap/);
    await actor.clear(nameInput);
    await actor.type(nameInput, '  Budi Baru  ');
    expect(save).toBeEnabled();
    await actor.click(save);

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/v1/users/user-1', {
        name: 'Budi Baru',
        email: 'budi@example.com',
      })
    );
    await waitFor(() =>
      expect(showMock).toHaveBeenCalledWith({
        color: 'teal',
        title: 'Berhasil',
        message: 'Perubahan profil berhasil disimpan.',
      })
    );
  });

  it('rejects an empty name with a validation notification and no request', async () => {
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });

    await actor.clear(screen.getByLabelText(/Nama Lengkap/));
    await actor.type(screen.getByLabelText(/Nama Lengkap/), '   ');
    await actor.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

    await waitFor(() =>
      expect(showMock).toHaveBeenCalledWith({
        color: 'red',
        title: 'Validasi Gagal',
        message: 'Nama dan email tidak boleh kosong.',
      })
    );
    expect(patchMock).not.toHaveBeenCalled();
  });

  it('restores the fetched values on cancel', async () => {
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });

    await actor.type(screen.getByLabelText(/Nama Lengkap/), 'X');
    await actor.click(screen.getByRole('button', { name: 'Batal' }));

    expect(screen.getByLabelText(/Nama Lengkap/)).toHaveValue('Budi Santoso');
  });

  it('enables the password submit only for 8+ characters that match, and patches the password', async () => {
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    await actor.click(screen.getByRole('tab', { name: /Keamanan & Kata Sandi/ }));

    const submit = screen.getByRole('button', { name: 'Perbarui Kata Sandi' });
    await actor.type(screen.getByLabelText(/^Kata Sandi Baru/), 'abc12345');
    expect(submit).toBeDisabled();
    await actor.type(screen.getByLabelText(/Konfirmasi Kata Sandi Baru/), 'abc12345');
    expect(submit).toBeEnabled();
    await actor.click(submit);

    await waitFor(() =>
      expect(patchMock).toHaveBeenCalledWith('/v1/users/user-1', { password: 'abc12345' })
    );
    await waitFor(() => expect(screen.getByLabelText(/^Kata Sandi Baru/)).toHaveValue(''));
  });

  it('shows the permission matrix with administrator access for an admin', async () => {
    const actor = userEvent.setup();
    renderPage();
    await screen.findByRole('heading', { name: 'Budi Santoso' });
    await actor.click(screen.getByRole('tab', { name: /Hak Akses & Peran/ }));

    expect(screen.getByText('Master Data & Pengaturan Entitas')).toBeInTheDocument();
    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getAllByText('Penuh (Baca & Tulis)')).toHaveLength(4);
  });

  it('falls back to placeholders when the user has no site or dates', async () => {
    getMock.mockResolvedValue({
      ...user,
      role: 'staff',
      isEmailVerified: false,
      site: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    });
    renderPage();

    expect(await screen.findByText('Aktif (Belum Verifikasi)')).toBeInTheDocument();
    expect(screen.getByText('Bergabung: -')).toBeInTheDocument();
    expect(screen.getByText('Utama')).toBeInTheDocument();
    expect(screen.getAllByText('STAFF').length).toBeGreaterThan(0);
  });
});
