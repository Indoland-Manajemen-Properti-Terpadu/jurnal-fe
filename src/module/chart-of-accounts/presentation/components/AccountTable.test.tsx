import { useState } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, userEvent } from '@test-utils';
import type { AccountFilter } from '../../domain/accountTree';
import type { JournalAccounts } from '../../domain/journalAccount';
import useAccountStore from '../hooks/useAccountStore';
import TableAccounts from './AccountTable';

const account = (overrides: Partial<JournalAccounts>): JournalAccounts => ({
  id: 'x',
  name: 'Akun',
  amount: 0,
  debit: 0,
  credit: 0,
  ...overrides,
});

const accounts = [
  account({
    id: 'kas',
    name: 'Kas Dan Setara Kas',
    accountNumber: '1-10000',
    isLocked: 'true',
    subAccount: [
      account({ id: 'kecil', name: 'Kas Kecil', accountNumber: '1-10001', isLocked: 'true' }),
      account({ id: 'midtrans', name: 'Midtrans', accountNumber: '1-10005' }),
    ],
  }),
  account({
    id: 'hutang',
    name: 'Hutang Usaha',
    accountNumber: '2-10000',
    subAccount: [account({ id: 'vendor', name: 'Hutang Vendor', accountNumber: '2-10001' })],
  }),
];

const allFilter: AccountFilter = { tab: 'all', category: null, search: '' };

const Harness = ({ initial = allFilter }: { initial?: AccountFilter }) => {
  const [filter] = useState(initial);
  return (
    <MemoryRouter>
      <TableAccounts
        accounts={accounts}
        filter={filter}
        onRetry={vi.fn()}
        onResetFilters={vi.fn()}
      />
    </MemoryRouter>
  );
};

const selectedIds = () =>
  useAccountStore
    .getState()
    .selectedRecords.map((r) => r.id)
    .sort();

describe('AccountTable selection', () => {
  beforeEach(() => useAccountStore.getState().setSelectedRecords([]));

  it('select all also selects open sub accounts that are still collapsed', async () => {
    render(<Harness />);
    await userEvent
      .setup()
      .click(screen.getByRole('checkbox', { name: 'Pilih semua akun yang tampil' }));
    expect(selectedIds()).toEqual(['hutang', 'midtrans', 'vendor']);
  });

  it('keeps the header checkbox in sync and clears on a second click', async () => {
    render(<Harness />);
    const user = userEvent.setup();
    const header = screen.getByRole('checkbox', { name: 'Pilih semua akun yang tampil' });
    await user.click(header);
    expect(header).toBeChecked();
    await user.click(header);
    expect(selectedIds()).toEqual([]);
  });

  it('a parent checkbox selects its open sub accounts and skips locked ones', async () => {
    render(<Harness />);
    await userEvent
      .setup()
      .click(screen.getByRole('checkbox', { name: 'Pilih akun Kas Dan Setara Kas' }));
    expect(selectedIds()).toEqual(['midtrans']);
  });
});

describe('AccountTable locked tab', () => {
  it('lists only locked sub accounts under a locked parent', () => {
    render(<Harness initial={{ ...allFilter, tab: 'locked' }} />);
    expect(screen.getByText('Kas Kecil')).toBeInTheDocument();
    expect(screen.queryByText('Midtrans')).not.toBeInTheDocument();
    expect(screen.queryByText('Hutang Usaha')).not.toBeInTheDocument();
  });

  it('disables select all when nothing listed can be selected', () => {
    render(<Harness initial={{ ...allFilter, tab: 'locked' }} />);
    expect(screen.getByRole('checkbox', { name: 'Pilih semua akun yang tampil' })).toBeDisabled();
  });
});
