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
        <Route path="/settings" element={<div>halaman pengaturan</div>} />
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

  it('opens a card with the name and the email', async () => {
    await open();
    expect(await screen.findByText('budi@example.com')).toBeTruthy();
  });

  it('falls back to the name of the session while the profile loads', () => {
    m.profile = { data: undefined };
    renderMenu();
    expect(screen.getByRole('button', { name: 'Menu pengguna' }).textContent).toContain(
      'Superadmin'
    );
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

  it('opens the settings', async () => {
    await open();
    await userEvent.click(
      await screen.findByRole('menuitem', { name: /Pengaturan/, hidden: true })
    );
    expect(await screen.findByText('halaman pengaturan')).toBeTruthy();
  });

  it('links to the help in a new tab, safely', async () => {
    await open();
    const link = (await screen.findByRole('menuitem', {
      name: /Bantuan/,
      hidden: true,
    })) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://proapps.id');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
  });

  it('switches the language from the menu', async () => {
    await open();
    await userEvent.click(await screen.findByText('EN', {}, { timeout: 4000 }));
    expect(useI18nStore.getState().language).toBe('en');
  });
});
