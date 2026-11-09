import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { IconReceipt2 } from '@tabler/icons-react';
import { render, screen, userEvent } from '@test-utils';
import { routes } from '@/router/routes';
import { PlannedModulePage } from './PlannedModulePage';
import { PrototypeNotice } from './PrototypeNotice';

vi.mock('@/components/AppShellLayout', () => ({
  AppShellLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={['/module']}>
      <Routes>
        <Route
          path="/module"
          element={<PlannedModulePage moduleKey="expenses" icon={IconReceipt2} />}
        />
        <Route path={routes.dashboard} element={<div>Ringkasan</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('PlannedModulePage', () => {
  it('shows the shared header and the planned scope of the module', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Biaya', level: 2 })).toBeInTheDocument();
    expect(
      screen.getByText('Catat dan kelola pengeluaran operasional perusahaan.')
    ).toBeInTheDocument();
    expect(screen.getByText('Modul ini sedang disiapkan')).toBeInTheDocument();
    expect(screen.getByText('Rencana cakupan')).toBeInTheDocument();
    expect(screen.getByText('Lampirkan bukti pembayaran')).toBeInTheDocument();
  });

  it('never shows a route or other technical wording', () => {
    renderPage();

    expect(screen.queryByText(/\b(rute|route|api)\b/i)).toBeNull();
  });

  it('leads back to the overview', async () => {
    renderPage();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Kembali ke Ringkasan' }));

    expect(await screen.findByText('Ringkasan')).toBeInTheDocument();
  });
});

describe('PrototypeNotice', () => {
  it('says the figures are samples and not the books', () => {
    render(<PrototypeNotice />);

    expect(screen.getByText('Contoh tampilan')).toBeInTheDocument();
    expect(screen.getByText(/belum berasal dari pembukuan Anda/)).toBeInTheDocument();
  });
});
