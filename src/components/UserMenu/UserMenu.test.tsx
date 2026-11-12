import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18nStore } from '@/i18n/store';
import { UserMenu } from '@/components/UserMenu/UserMenu';

const m = vi.hoisted(() => ({
  profile: {} as Record<string, unknown>,
  clearTokens: vi.fn(),
}));
vi.mock('@/components/UserMenu/useSessionProfile', () => ({ useSessionProfile: () => m.profile }));
vi.mock('@/store/useAuthentications', () => ({
  useAuthStore: (select: (state: unknown) => unknown) =>
    select({ userName: 'superadmin', clearTokens: m.clearTokens }),
}));

const renderMenu = () =>
  render(
    <MemoryRouter initialEntries={['/x']}>
      <Routes>
        <Route path="/x" element={<UserMenu />} />
        <Route path="/profile" element={<div>halaman profil</div>} />
        <Route path="/login" element={<div>halaman masuk</div>} />
      </Routes>
    </MemoryRouter>
  );

const open = async () => {
  renderMenu();
  await userEvent.click(screen.getByRole('button', { name: 'Menu pengguna' }));
};

describe('UserMenu', () => {
  beforeEach(() => {
    useI18nStore.getState().setLanguage('id');
    m.clearTokens.mockReset();
    m.profile = {
      data: {
        name: 'Budi Santoso',
        email: 'budi@example.com',
        role: 'Superadmin',
        initials: 'BS',
        site: { name: 'Demo Site', code: '991276' },
      },
    };
  });

  it('names the person and the company on the button itself', () => {
    renderMenu();
    const button = screen.getByRole('button', { name: 'Menu pengguna' });
    expect(button.textContent).toContain('Budi Santoso');
    expect(button.textContent).toContain('Demo Site');
  });

  it('opens a card with the name, the email, the role and the company with its id', async () => {
    await open();
    expect(await screen.findByText('budi@example.com')).toBeTruthy();
    expect(screen.getByText('Superadmin')).toBeTruthy();
    expect(screen.getByText('ID 991276')).toBeTruthy();
  });

  it('falls back to the name of the session while the profile loads', () => {
    m.profile = { data: undefined };
    renderMenu();
    expect(screen.getByRole('button', { name: 'Menu pengguna' }).textContent).toContain(
      'Superadmin'
    );
  });

  it('leaves out the company card for a user without a site', async () => {
    m.profile = {
      data: { name: 'Budi', email: 'b@x.id', role: 'User', initials: 'B', site: undefined },
    };
    await open();
    await screen.findByText('b@x.id');
    expect(screen.queryByText(/^ID /)).toBeNull();
  });

  it('goes to the profile page', async () => {
    await open();
    await userEvent.click(await screen.findByRole('menuitem', { name: /Profil/, hidden: true }));
    expect(await screen.findByText('halaman profil')).toBeTruthy();
  });

  it('signs out: clears the session and goes to the login page', async () => {
    await open();
    await userEvent.click(await screen.findByRole('menuitem', { name: /Keluar/, hidden: true }));
    expect(m.clearTokens).toHaveBeenCalled();
    expect(await screen.findByText('halaman masuk')).toBeTruthy();
  });
});
