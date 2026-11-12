import { render, screen, userEvent, waitFor } from '@test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useI18nStore } from '@/i18n/store';
import { AppSwitcher } from '@/components/AppSwitcher/AppSwitcher';

vi.mock('@/store/useAuthentications', () => ({
  useAuthStore: (select: (state: { userName: string }) => unknown) => select({ userName: 'budi' }),
}));

const open = async () => {
  render(<AppSwitcher />);
  await userEvent.click(screen.getByRole('button', { name: 'Aplikasi' }));
};

describe('AppSwitcher', () => {
  beforeEach(() => {
    // The language is kept in localStorage; another test of the same worker may have changed it.
    useI18nStore.getState().setLanguage('id');
  });

  it('opens from one button in the header', async () => {
    render(<AppSwitcher />);
    expect(screen.queryByText('Aplikasi ProApps')).toBeNull();
    await userEvent.click(screen.getByRole('button', { name: 'Aplikasi' }));
    expect(await screen.findByText('Aplikasi ProApps', {}, { timeout: 4000 })).toBeTruthy();
  });

  it('greets the user by name', async () => {
    await open();
    expect(await screen.findByText('Halo Budi')).toBeTruthy();
  });

  it('shows the app in use as a card that is not a link, marked as in use', async () => {
    await open();
    const card = (await screen.findByText('Jurnal ProApps')).closest('[data-app="jurnal"]');
    expect(card).toBeTruthy();
    expect(card?.tagName).not.toBe('A');
    expect(card?.textContent).toContain('Sedang dipakai');
  });

  it('shows the other apps as links that open in a new tab, safely', async () => {
    await open();
    const link = (await screen.findByRole(
      'link',
      { name: /ProApps.*tab baru/, hidden: true },
      { timeout: 4000 }
    )) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('https://proapps.id');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(screen.getByText('Manajemen properti dan gedung')).toBeTruthy();
  });

  it('closes with Escape', async () => {
    await open();
    await screen.findByText('Aplikasi ProApps', {}, { timeout: 4000 });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByText('Aplikasi ProApps')).toBeNull());
  });

  it('puts the logo and the name of an app on one row', async () => {
    await open();
    const link = await screen.findByRole(
      'link',
      { name: /ProApps.*tab baru/, hidden: true },
      { timeout: 4000 }
    );
    const logo = link.querySelector('img');
    expect(logo).toBeTruthy();
    expect(logo?.getAttribute('src')).toBeTruthy();
    const row = logo?.parentElement;
    expect(row?.contains(screen.getByText('ProApps'))).toBe(true);
    expect(row?.contains(screen.getByText('Manajemen properti dan gedung'))).toBe(true);
  });

  it('shows the logo of the app in use as well', async () => {
    await open();
    const card = (await screen.findByText('Jurnal ProApps')).closest('[data-app="jurnal"]');
    expect(card?.querySelector('img')).toBeTruthy();
  });
});
