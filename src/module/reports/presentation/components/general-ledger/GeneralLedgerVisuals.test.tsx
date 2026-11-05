import { render, screen, userEvent } from '@test-utils';
import { BalanceTrendChart } from './BalanceTrendChart';
import { DebitCreditBars } from './DebitCreditBars';
import { GeneralLedgerPager } from './GeneralLedgerPager';
import { MovementBars } from './MovementBars';

describe('general ledger visuals', () => {
  it('describes the balance trend and shows its highest and lowest balance', () => {
    render(
      <BalanceTrendChart
        points={[
          { date: '2026-11-01', balance: 100000 },
          { date: '2026-11-03', balance: 40000 },
        ]}
      />
    );
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByText('01/11/2026')).toBeInTheDocument();
    expect(screen.getByText('03/11/2026')).toBeInTheDocument();
    expect(screen.getByText(/100\.000/)).toBeInTheDocument();
    expect(screen.getByText(/40\.000/)).toBeInTheDocument();
  });

  it('draws a flat trend for an account with a single point', () => {
    render(<BalanceTrendChart points={[{ date: '2026-11-01', balance: 5 }]} />);
    expect(screen.getByRole('img')).toBeInTheDocument();
  });

  it('draws one bar group per day of movement', () => {
    const { container } = render(
      <MovementBars
        granularity="day"
        buckets={[
          { key: '2026-11-01', debit: 10, credit: 0 },
          { key: '2026-11-02', debit: 0, credit: 5 },
        ]}
      />
    );
    expect(container.querySelectorAll('[class*="barGroup"]')).toHaveLength(2);
  });

  it('shows both totals of the debit and credit comparison', () => {
    render(<DebitCreditBars debit={1000} credit={1000} />);
    expect(screen.getAllByText(/1\.000/)).toHaveLength(2);
  });

  it('pages through the accounts and says which ones are shown', async () => {
    const onChange = vi.fn();
    render(
      <GeneralLedgerPager
        pagination={{ page: 1, limit: 20, totalAccounts: 66, totalPages: 4 }}
        onChange={onChange}
      />
    );
    expect(screen.getByText('Menampilkan 1–20 dari 66')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '2' }));
    expect(onChange).toHaveBeenCalledWith(2);
  });

  it('shows no page switch when everything fits on one page', () => {
    render(
      <GeneralLedgerPager
        pagination={{ page: 1, limit: 20, totalAccounts: 5, totalPages: 1 }}
        onChange={vi.fn()}
      />
    );
    expect(screen.queryByRole('button', { name: '2' })).not.toBeInTheDocument();
  });
});
