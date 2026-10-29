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

  // R7, known gap: the account list has no account, so the ':idAccount' placeholder of the draft
  // import route is not substituted. The draft page then reads the literal ":idAccount" as the
  // account id (confirm payload and the redirect after the import). See the README, known gaps.
  it('opens the bank statement draft import route with the placeholder still in the path', async () => {
    renderActions();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'Aksi Lainnya' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Impor Rekening Koran' }));
    expect(screen.getByTestId('location')).toHaveTextContent(
      routes.generalJournal.bankStatementDraftImport
    );
    expect(routes.generalJournal.bankStatementDraftImport).toContain(':idAccount');
  });
});
