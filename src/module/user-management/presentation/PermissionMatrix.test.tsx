import { fireEvent, screen } from '@testing-library/react';
import type { MyGrants } from '@/module/user-management/domain/grantRules';
import type {
  MenuPermission,
  PermissionMenu,
} from '@/module/user-management/domain/rolePermissions';
import { render } from '@test-utils';
import { PermissionMatrix } from './components/PermissionMatrix';

const menus: PermissionMenu[] = [
  { menuId: 'JP-SALES', name: 'Sales', enabled: 'crud' },
  {
    menuId: 'JP-GL',
    name: 'General Ledger',
    enabled: 'crud',
    menus: [{ menuId: 'JP-GL-BB', name: 'Balance Sheet', enabled: 'r' }],
  },
];

const blank = (menuId: string): MenuPermission => ({
  menuId,
  create: false,
  read: false,
  update: false,
  delete: false,
});

const permissions = ['JP-SALES', 'JP-GL', 'JP-GL-BB'].map(blank);
const me: MyGrants = {
  isSuperAdmin: false,
  permissions: [{ ...blank('JP-SALES'), read: true }],
};

const renderMatrix = (props: Partial<React.ComponentProps<typeof PermissionMatrix>> = {}) => {
  const onChange = vi.fn();
  render(
    <PermissionMatrix
      menus={menus}
      permissions={permissions}
      original={permissions}
      grants={me}
      readOnly={false}
      onChange={onChange}
      {...props}
    />
  );
  return onChange;
};

describe('PermissionMatrix', () => {
  it('lets a person tick a right they hold', () => {
    const onChange = renderMatrix();

    fireEvent.click(screen.getByLabelText('Sales: Lihat'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const next = onChange.mock.calls[0][0] as MenuPermission[];
    expect(next.find((entry) => entry.menuId === 'JP-SALES')?.read).toBe(true);
    expect(next.find((entry) => entry.menuId === 'JP-GL')?.read).toBe(false);
  });

  it('blocks a right above the person’s own', () => {
    renderMatrix();

    expect(screen.getByLabelText('Sales: Hapus')).toBeDisabled();
    expect(screen.getByLabelText('General Ledger: Lihat')).toBeDisabled();
  });

  it('keeps a right the role already had enabled to untick', () => {
    const had = permissions.map((entry) =>
      entry.menuId === 'JP-GL' ? { ...entry, read: true } : entry
    );

    renderMatrix({ permissions: had, original: had });

    expect(screen.getByLabelText('General Ledger: Lihat')).toBeEnabled();
  });

  it('shows no checkbox where the menu does not support the action', () => {
    renderMatrix({ grants: { isSuperAdmin: true, permissions: [] } });

    expect(screen.getByLabelText('Balance Sheet: Lihat')).toBeEnabled();
    expect(screen.queryByLabelText('Balance Sheet: Buat')).toBeNull();
  });

  it('is read-only when asked', () => {
    renderMatrix({ readOnly: true, grants: { isSuperAdmin: true, permissions: [] } });

    expect(screen.getByLabelText('Sales: Lihat')).toBeDisabled();
  });

  it('selects a whole column at once for a superadmin', () => {
    const onChange = renderMatrix({ grants: { isSuperAdmin: true, permissions: [] } });

    fireEvent.click(screen.getByLabelText('Lihat: pilih semua menu'));

    const next = onChange.mock.calls[0][0] as MenuPermission[];
    expect(next.every((entry) => entry.read)).toBe(true);
  });
});
