import { render, screen } from '@test-utils';
import { BalancePosition } from './BalancePosition';

const position = {
  hasData: true,
  loading: false,
  isBalanced: true,
  assets: 1000,
  liabilities: 400,
  equity: 600,
  liabilityRatio: 40,
  equityRatio: 60,
  workingCapital: 200,
};

describe('balance sheet visualization', () => {
  it('shows funding shares only when both components form a valid positive composition', () => {
    render(<BalancePosition {...position} />);
    const shares = screen.getAllByRole('progressbar');
    expect(shares.map((bar) => bar.getAttribute('aria-valuenow'))).toEqual(['40', '60']);
  });

  it('preserves negative equity without drawing a misleading positive share', () => {
    render(
      <BalancePosition
        {...position}
        liabilities={1200}
        equity={-200}
        liabilityRatio={120}
        equityRatio={-20}
      />
    );
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.getByText(/-Rp/)).toBeInTheDocument();
  });

  it('does not claim balanced books or show financial figures when data is unavailable', () => {
    render(<BalancePosition {...position} hasData={false} />);
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByText(/Rp/)).not.toBeInTheDocument();
  });
});
