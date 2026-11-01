import { render, screen } from '@test-utils';
import { JournalValidationCard } from './JournalValidationCard';
import { useTransactionStore } from '../store/useTransactionStore';

const row = (account: string, debit: number, credit: number, key: string) => ({
  account,
  description: '',
  debit,
  credit,
  key,
});

describe('I2 validation card', () => {
  it('shows "Siap Dibukukan" for a balanced one-sided journal', () => {
    useTransactionStore.setState({
      transactions: [row('A', 100, 0, 'a'), row('B', 0, 100, 'b')],
    });
    render(<JournalValidationCard transactionDate="2026-05-01" />);
    expect(screen.getByText('Siap Dibukukan')).toBeInTheDocument();
  });

  it('stays incomplete when a row holds both sides', () => {
    useTransactionStore.setState({
      transactions: [row('A', 100, 100, 'a'), row('B', 0, 100, 'b')],
    });
    render(<JournalValidationCard transactionDate="2026-05-01" />);
    expect(screen.getByText('Belum Lengkap')).toBeInTheDocument();
  });
});
