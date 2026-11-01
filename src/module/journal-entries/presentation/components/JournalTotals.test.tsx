import { render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import JournalTotals from './JournalTotals';
import { useTransactionStore } from '../store/useTransactionStore';

const row = (debit: number, credit: number, key: string) => ({
  account: key,
  description: '',
  debit,
  credit,
  key,
});

describe('JournalTotals', () => {
  afterEach(() => useI18nStore.getState().setLanguage('id'));

  it('shows the difference in Indonesian', () => {
    useTransactionStore.setState({ transactions: [row(100, 0, 'a'), row(0, 40, 'b')] });
    render(<JournalTotals />);
    expect(screen.getByText(/Selisih: Rp 60,00/)).toBeInTheDocument();
  });

  it('shows the difference in English', () => {
    useI18nStore.getState().setLanguage('en');
    useTransactionStore.setState({ transactions: [row(100, 0, 'a'), row(0, 40, 'b')] });
    render(<JournalTotals />);
    expect(screen.getByText(/Difference: Rp 60,00/)).toBeInTheDocument();
  });

  it('reads 0.1 + 0.2 against 0.3 as balanced', () => {
    useTransactionStore.setState({
      transactions: [row(0.1, 0, 'a'), row(0.2, 0, 'b'), row(0, 0.3, 'c')],
    });
    render(<JournalTotals />);
    expect(screen.getByText('Seimbang')).toBeInTheDocument();
  });
});
