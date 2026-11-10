import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import ReportCatalogPage from './ReportCatalogPage';

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
  it('groups the reports into sections and marks the ones that are not available yet', () => {
    renderPage();
    expect(screen.getByRole('heading', { name: 'Pusat Laporan Keuangan' })).toBeInTheDocument();
    expect(screen.getAllByText('Laporan Keuangan').length).toBeGreaterThan(0);
    expect(screen.getByText('Neraca')).toBeInTheDocument();
    expect(screen.getAllByText('Segera hadir').length).toBe(6);
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
