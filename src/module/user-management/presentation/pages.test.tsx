import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from '@test-utils';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import type { PermissionMenu } from '@/module/user-management/domain/rolePermissions';
import type { ManagedUser } from '@/module/user-management/domain/userTypes';
import * as roleApi from '@/module/user-management/infrastructure/roleApi';
import * as userApi from '@/module/user-management/infrastructure/userApi';
import RoleFormPage from './pages/RoleFormPage';
import UserFormPage from './pages/UserFormPage';
import RolesPage from './pages/RolesPage';
import UsersPage from './pages/UsersPage';
import AccessHistoryPage from './pages/AccessHistoryPage';

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/module/settings', () => ({
  SettingsLayout: ({
    children,
    action,
  }: {
    children: React.ReactNode;
    action?: React.ReactNode;
  }) => (
    <div>
      {action}
      {children}
    </div>
  ),
}));
vi.mock('@/module/user-management/infrastructure/menuApi', () => ({
  fetchMenus: async (): Promise<PermissionMenu[]> => [
    { menuId: 'JP-SALES', name: 'Sales', enabled: 'crud' },
  ],
}));
vi.mock('@/module/user-management/infrastructure/myPermissionsApi', () => ({
  fetchMyGrants: async () => ({ isSuperAdmin: true, permissions: [] }),
  fetchMyId: async () => 'me',
}));
vi.mock('@/module/user-management/infrastructure/auditApi', () => ({
  fetchAuditLog: async () => ({ results: [], page: 1, limit: 20, totalPages: 1, totalResults: 0 }),
}));
vi.mock('@/module/user-management/infrastructure/userApi');
vi.mock('@/module/user-management/infrastructure/roleApi');

const role = (over: Partial<AccessRole>): AccessRole => ({
  id: 'r1',
  name: 'Kasir',
  description: 'Mengelola penjualan',
  isDefault: false,
  permissions: [],
  ...over,
});

const person: ManagedUser = {
  id: 'u1',
  name: 'Sari',
  email: 'sari@x.id',
  isActive: true,
  accessRoleIds: ['r1'],
  legacyRole: 'user',
  createdAt: '2026-10-01T00:00:00Z',
};

const mountAt = (path: string, element: React.ReactElement, route = path) => {
  const router = createMemoryRouter(
    [
      { path: route, element },
      { path: '*', element: <div /> },
    ],
    {
      initialEntries: [path],
    }
  );
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(userApi.fetchUsers).mockResolvedValue({
    results: [person],
    page: 1,
    limit: 10,
    totalPages: 1,
    totalResults: 1,
  });
  vi.mocked(roleApi.fetchRoles).mockResolvedValue([
    role({}),
    role({ id: 'r2', name: 'Super Admin', isDefault: true }),
  ]);
});

describe('UsersPage', () => {
  it('lists users with their role names, access level and an add action', async () => {
    mountAt('/um', <UsersPage />);

    expect((await screen.findAllByText('Sari')).length).toBeGreaterThan(0);
    expect((await screen.findAllByText('Kasir')).length).toBeGreaterThan(0);
    expect(screen.getByText('Tanpa akses')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tambah Pengguna' })).toBeInTheDocument();
  });

  it('shows the roles in use with their members and a way to manage them', async () => {
    mountAt('/um', <UsersPage />);

    expect(await screen.findByText('Peran yang dipakai')).toBeInTheDocument();
    expect(screen.getByText('1 pengguna')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Kelola' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Lihat semua peran' })).toBeInTheDocument();
  });

  it('has a tab with the count of every role that has members', async () => {
    mountAt('/um', <UsersPage />);

    expect(await screen.findByRole('tab', { name: 'Semua (1)' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Kasir (1)' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: /Super Admin/ })).toBeNull();
  });

  it('narrows the table by search and offers a reset when nothing matches', async () => {
    mountAt('/um', <UsersPage />);

    await screen.findAllByText('Sari');
    fireEvent.change(screen.getByLabelText('Cari nama atau email'), { target: { value: 'zzz' } });

    expect(await screen.findByText('Tidak ada pengguna yang cocok')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Atur ulang' }));
    expect(within(screen.getByRole('table')).getByText('Sari')).toBeInTheDocument();
  });

  it('keeps the table to the people of the chosen role', async () => {
    mountAt('/um', <UsersPage />);

    fireEvent.click(await screen.findByRole('tab', { name: 'Kasir (1)' }));
    const table = screen.getByRole('table');

    expect(within(table).getByText('Sari')).toBeInTheDocument();
  });

  it('tells a person without access that they have none, with no retry', async () => {
    // What the HTTP client rejects with for a 403, without importing the client library here.
    vi.mocked(userApi.fetchUsers).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    mountAt('/um', <UsersPage />);

    expect(await screen.findByText('Anda belum memiliki akses ke bagian ini.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Coba lagi' })).toBeNull();
  });
});

describe('RolesPage', () => {
  it('separates built-in roles from the roles the person made', async () => {
    mountAt('/roles', <RolesPage />);

    expect(await screen.findByText('Peran bawaan')).toBeInTheDocument();
    expect(screen.getByText('Peran buatan Anda')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buat Peran' })).toBeInTheDocument();
  });

  it('tells how many people hold each role', async () => {
    mountAt('/roles', <RolesPage />);

    expect(await screen.findByText('Belum ada akses menu · 1 pengguna')).toBeInTheDocument();
    expect(screen.getByText('Belum ada akses menu · 0 pengguna')).toBeInTheDocument();
  });
});

describe('AccessHistoryPage', () => {
  it('shows the empty history state', async () => {
    mountAt('/history', <AccessHistoryPage />);

    expect(await screen.findByText('Belum ada riwayat perubahan')).toBeInTheDocument();
  });
});

describe('RoleFormPage', () => {
  it('creates a role with only the rights that were ticked', async () => {
    vi.mocked(roleApi.createRole).mockResolvedValue(role({}));
    mountAt('/roles/new', <RoleFormPage mode="add" />);

    fireEvent.change(await screen.findByLabelText(/Nama peran/), {
      target: { value: 'Staf Keuangan' },
    });
    fireEvent.click(screen.getByLabelText('Sales: Lihat'));
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Peran' }));

    await waitFor(() => expect(roleApi.createRole).toHaveBeenCalled());
    expect(vi.mocked(roleApi.createRole).mock.calls[0][0]).toEqual({
      name: 'Staf Keuangan',
      menuAccessRolePermission: [
        { menuId: 'JP-SALES', create: false, read: true, update: false, delete: false },
      ],
    });
  });

  it('does not save a role without a name', async () => {
    mountAt('/roles/new', <RoleFormPage mode="add" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Simpan Peran' }));

    expect(await screen.findByText('Nama peran wajib diisi.')).toBeInTheDocument();
    expect(roleApi.createRole).not.toHaveBeenCalled();
  });

  it('shows a built-in role read-only', async () => {
    vi.mocked(roleApi.fetchRole).mockResolvedValue(
      role({ id: 'r2', name: 'Super Admin', isDefault: true })
    );
    mountAt('/roles/r2', <RoleFormPage mode="view" />, '/roles/:id');

    expect(await screen.findByText(/Peran bawaan tidak dapat diubah/)).toBeInTheDocument();
    expect(screen.getByLabelText('Sales: Lihat')).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Simpan Peran' })).toBeNull();
  });
});

describe('UserFormPage', () => {
  it('asks for the required details before creating a user', async () => {
    mountAt('/users/new', <UserFormPage mode="add" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Simpan Pengguna' }));

    expect(await screen.findByText('Nama wajib diisi.')).toBeInTheDocument();
    expect(screen.getByText('Pilih minimal satu peran.')).toBeInTheDocument();
    expect(userApi.createUser).not.toHaveBeenCalled();
  });

  it('creates a user with the chosen role', async () => {
    vi.mocked(userApi.createUser).mockResolvedValue(person);
    mountAt('/users/new', <UserFormPage mode="add" />);

    fireEvent.change(await screen.findByLabelText(/Nama lengkap/), { target: { value: 'Sari' } });
    fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'sari@x.id' } });
    fireEvent.click(await screen.findByText('Kasir'));
    fireEvent.change(screen.getByLabelText(/^Kata sandi/), { target: { value: 'abcdefg1' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Pengguna' }));

    await waitFor(() => expect(userApi.createUser).toHaveBeenCalled());
    expect(vi.mocked(userApi.createUser).mock.calls[0][0]).toEqual({
      name: 'Sari',
      email: 'sari@x.id',
      password: 'abcdefg1',
      accessRoleIds: ['r1'],
    });
  });

  it('opens an existing user and sends only what changed', async () => {
    vi.mocked(userApi.updateUser).mockResolvedValue(person);
    const router = createMemoryRouter(
      [
        { path: '/users/:userId/edit', element: <UserFormPage mode="edit" /> },
        { path: '*', element: <div /> },
      ],
      { initialEntries: [{ pathname: '/users/u1/edit', state: { user: person } }] }
    );
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    render(
      <QueryClientProvider client={client}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    );

    const name = await screen.findByLabelText(/Nama lengkap/);
    expect(name).toHaveValue('Sari');
    fireEvent.change(name, { target: { value: 'Sari W' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

    await waitFor(() => expect(userApi.updateUser).toHaveBeenCalled());
    expect(vi.mocked(userApi.updateUser).mock.calls[0]).toEqual(['u1', { name: 'Sari W' }]);
  });
});
