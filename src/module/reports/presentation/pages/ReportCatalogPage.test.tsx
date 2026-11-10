import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import ReportCatalogPage from './ReportCatalogPage';

const grants = vi.hoisted(() => ({ isReady: true, allowed: true }));
vi.mock('@/module/user-management', () => ({
  useMyGrants: () => ({ isReady: grants.isReady, can: () => grants.allowed }),
}));
vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <ReportCatalogPage />
    </MemoryRouter>
  );

describe('ReportCatalogPage', () => {
  beforeEach(() => {
    grants.isReady = true;
    grants.allowed = true;
  });

  it('hides the profit and loss card from a role without its right, but not before the rights load', () => {
    grants.allowed = false;
    const { unmount } = renderPage();
    expect(screen.queryByText('Laba Rugi')).not.toBeInTheDocument();
    expect(screen.getByText('Neraca')).toBeInTheDocument();
    unmount();

    grants.isReady = false;
    renderPage();
    expect(screen.getByText('Laba Rugi')).toBeInTheDocument();
  });

  it('hides the trial balance card from a role without its right, but not before the rights load', () => {
    grants.allowed = false;
    const { unmount } = renderPage();
    expect(screen.queryByText('Neraca Saldo')).not.toBeInTheDocument();
    unmount();

    grants.isReady = false;
    renderPage();
    expect(screen.getByText('Neraca Saldo')).toBeInTheDocument();
  });

  it('groups the reports into sections and marks the ones that are not available yet', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Pusat Laporan Keuangan' })).toBeInTheDocument();
    expect(screen.getAllByText('Laporan Keuangan').length).toBeGreaterThan(0);
    expect(screen.getByText('Neraca')).toBeInTheDocument();
    expect(screen.getAllByText('Segera hadir').length).toBe(4);
  });

  it('lists the reports with real data first in their section', () => {
    renderPage();
    const titles = screen.getAllByRole('link').map((link) => link.textContent ?? '');
    const ledgerIndex = titles.findIndex((text) => text.includes('Buku Besar'));
    const journalIndex = titles.findIndex((text) => text.includes('Jurnal Umum'));
    expect(ledgerIndex).toBeLessThan(journalIndex);
  });

  it('filters by search and offers a reset when nothing matches', async () => {
    renderPage();
    await userEvent.type(screen.getByRole('textbox'), 'neraca saldo');
    expect(screen.getByText('Neraca Saldo')).toBeInTheDocument();
    expect(screen.queryByText('Buku Besar')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByRole('textbox'));
    await userEvent.type(screen.getByRole('textbox'), 'zzzz');
    expect(screen.getByText('Laporan Tidak Ditemukan')).toBeInTheDocument();
  });
});
