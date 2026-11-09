import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
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
            />
          }
        />
        <Route path="*" element={<Probe />} />
      </Routes>
    </MemoryRouter>
  );

describe('AccountListHeaderActions navigation', () => {
  // Adding a journal lives in the General Journal; it is not repeated in this menu.
  it('does not repeat the add journal entry', async () => {
    renderActions();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    await screen.findByRole('menuitem', { name: 'Atur Akun Standar' });
    expect(screen.queryByRole('menuitem', { name: 'Tambah Transaksi Jurnal' })).toBeNull();
  });

  // The account list has no account, so a bank statement import entry here would navigate with the
  // ':idAccount' placeholder unfilled. The working entry is the import modal in the reconciliation
  // tab of a cash/bank account.
  it('does not offer a bank statement import item', async () => {
    renderActions();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    await screen.findByRole('menuitem', { name: 'Atur Akun Standar' });
    expect(screen.queryByText('Impor Rekening Koran')).toBeNull();
  });

  // Opening balances and period closing are sidebar entries; one place per task.
  it('does not repeat the opening balance and period closing entries of the sidebar', async () => {
    renderActions();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    await screen.findByRole('menuitem', { name: 'Atur Akun Standar' });
    expect(screen.queryByRole('menuitem', { name: /Saldo Awal/ })).toBeNull();
    expect(screen.queryByRole('menuitem', { name: /Tutup Buku/ })).toBeNull();
  });
});
