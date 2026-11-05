import { render, screen } from '@test-utils';
import type {
  BalanceSheetAccountItem,
  BalanceSheetData,
} from '@/module/reports/domain/balanceSheet.types';
import { ReportDonut } from '../shared/ReportDonut';
import { BalanceSheetInsights } from './BalanceSheetInsights';

const item = (categoryName: string, balance: number): BalanceSheetAccountItem => ({
  accountId: null,
  accountNumber: null,
  accountName: 'x',
  categoryId: null,
  categoryName,
  balance,
});

const data = {
  totalLiabilities: 250,
  totalEquity: 750,
  assets: {
    currentAssets: [item('Kas & Bank', 600), item('Akun Piutang', 300)],
    nonCurrentAssets: [item('Aktiva Tetap', 100)],
  },
} as BalanceSheetData;

describe('BalanceSheetInsights', () => {
  it('shows the funding split and the asset categories with their shares', () => {
    render(<BalanceSheetInsights data={data} />);
    expect(screen.getByText('Struktur Pendanaan')).toBeInTheDocument();
    expect(screen.getByText(/25%/)).toBeInTheDocument();
    expect(screen.getByText(/75%/)).toBeInTheDocument();
    expect(screen.getByText('Kas & Bank')).toBeInTheDocument();
    expect(screen.getByText(/60%/)).toBeInTheDocument();
    expect(screen.getByText('Aktiva Tetap')).toBeInTheDocument();
  });

  it('says so when there are no assets to compose', () => {
    render(
      <BalanceSheetInsights
        data={
          {
            ...data,
            assets: { currentAssets: [], nonCurrentAssets: [] },
          } as unknown as BalanceSheetData
        }
      />
    );
    expect(screen.getByText(/aset lancar tercatat/)).toBeInTheDocument();
  });
});

describe('ReportDonut', () => {
  it('draws a segment for each positive value and a track', () => {
    const { container } = render(
      <ReportDonut
        description="Komposisi"
        label="40%"
        segments={[
          { value: 3, tone: 'red' },
          { value: 0, tone: 'blue' },
          { value: 2, tone: 'green' },
        ]}
      />
    );
    expect(screen.getByRole('img', { name: 'Komposisi' })).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(container.querySelectorAll('circle')).toHaveLength(3);
  });

  it('leaves only the track when there is nothing to show', () => {
    const { container } = render(<ReportDonut description="Kosong" segments={[]} />);
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });
});
