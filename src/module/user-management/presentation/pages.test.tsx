import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { render } from '@test-utils';
import type { AccessRole } from '@/module/user-management/domain/accessRole';
import type { PermissionMenu } from '@/module/user-management/domain/rolePermissions';
import type { ManagedUser } from '@/module/user-management/domain/userTypes';
import * as roleApi from '@/module/user-management/infrastructure/roleApi';
import * as userApi from '@/module/user-management/infrastructure/userApi';
import RoleFormPage from './pages/RoleFormPage';
import UserFormPage from './pages/UserFormPage';
import UserManagementPage from './pages/UserManagementPage';

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

describe('UserManagementPage', () => {
  it('lists users with their role names and an add action', async () => {
    mountAt('/um', <UserManagementPage />);

    expect(await screen.findByText('Sari')).toBeInTheDocument();
    expect(await screen.findByText('Kasir')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Tambah Pengguna' })).toBeInTheDocument();
  });

  it('separates built-in roles from the roles the person made', async () => {
    mountAt('/um', <UserManagementPage />);

    fireEvent.click(await screen.findByRole('tab', { name: /Peran/ }));

    expect(await screen.findByText('Peran bawaan')).toBeInTheDocument();
    expect(screen.getByText('Peran buatan Anda')).toBeInTheDocument();
    expect(screen.getByText('Super Admin')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buat Peran' })).toBeInTheDocument();
  });

  it('shows the empty history state', async () => {
    mountAt('/um', <UserManagementPage />);

    fireEvent.click(await screen.findByRole('tab', { name: /Riwayat/ }));

    expect(await screen.findByText('Belum ada riwayat perubahan')).toBeInTheDocument();
  });

  it('tells a person without access that they have none, with no retry', async () => {
    // What the HTTP client rejects with for a 403, without importing the client library here.
    vi.mocked(userApi.fetchUsers).mockRejectedValue({
      isAxiosError: true,
      response: { status: 403, data: {} },
    });
    mountAt('/um', <UserManagementPage />);

    expect(await screen.findByText('Anda belum memiliki akses ke bagian ini.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Coba lagi' })).toBeNull();
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
