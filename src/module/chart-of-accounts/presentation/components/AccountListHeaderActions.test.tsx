import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import { routes } from '@/router/routes';
import { AccountListHeaderActions } from './AccountListHeaderActions';

const Probe = () => <div data-testid="location">{useLocation().pathname}</div>;

const renderActions = () =>
  render(
    <MemoryRouter initialEntries={['/list']}>
      <Routes>
        <Route
          path="/list"
          element={
            <AccountListHeaderActions
              isLoading={false}
              onRefresh={vi.fn()}
              onOpenSettings={vi.fn()}
              onOpenBeginningBalance={vi.fn()}
              onOpenPeriodLock={vi.fn()}
            />
          }
        />
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>
  );

describe('AccountListHeaderActions navigation', () => {
  it('opens the add journal entry page', async () => {
    renderActions();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Tambah Transaksi Jurnal' }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      routes.generalJournal.addTransactionJournal
    );
  });

  // The account list has no account, so a bank statement import entry here would navigate with the
  // ':idAccount' placeholder unfilled. The working entry is the import modal in the reconciliation
  // tab of a cash/bank account.
  it('does not offer a bank statement import item', async () => {
    renderActions();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    await screen.findByRole('menuitem', { name: 'Tambah Transaksi Jurnal' });
    expect(screen.queryByText('Impor Rekening Koran')).toBeNull();
  });
});
