import { render, screen } from '@test-utils';
import { countAccountStats } from '../../domain/accountStats';
import type { JournalAccounts } from '../../domain/journalAccount';
import { AccountStatsCards } from './AccountStatsCards';

const account = (overrides: Partial<JournalAccounts>): JournalAccounts => ({
  id: 'x',
  name: 'Akun',
  amount: 0,
  debit: 0,
  credit: 0,
  ...overrides,
});

describe('AccountStatsCards', () => {
  it('pairs each number with a picture that carries the same data', () => {
    const stats = countAccountStats([
      account({ id: 'a', accountNumber: '1-10000', isBankAndCash: true, isLocked: 'true' }),
      account({ id: 'b', accountNumber: '4-10000' }),
    ]);
    render(<AccountStatsCards stats={stats} />);

    expect(screen.getByRole('img', { name: /1: 1, 2: 0, 3: 0, 4: 1/ })).toBeInTheDocument();
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
    expect(screen.getByRole('progressbar', { name: /50%/ })).toBeInTheDocument();
  });

  it('renders without dividing by zero when there are no accounts', () => {
    render(<AccountStatsCards stats={countAccountStats([])} />);
    expect(screen.getAllByText('0%').length).toBeGreaterThan(0);
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '0');
  });
});
