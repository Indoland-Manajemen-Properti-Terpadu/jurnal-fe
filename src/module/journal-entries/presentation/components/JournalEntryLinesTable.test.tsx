import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@test-utils';
import JournalEntryLinesTable from './JournalEntryLinesTable';
import type { JournalEntryLine } from '../../domain/journalEntry';

const lines = (debit: number, credit: number): JournalEntryLine[] => [
  { id: '1', account: { id: 'a', name: 'Kas', accountNumber: '1-1000' }, debit },
  { id: '2', account: { id: 'b', name: 'Modal', accountNumber: '3-1000' }, credit },
];

const renderTable = (details: JournalEntryLine[]) =>
  render(
    <MemoryRouter>
      <JournalEntryLinesTable transactionDetails={details} />
    </MemoryRouter>
  );

describe('I3 journal detail table view tolerance (characterization)', () => {
  it('shows no difference line when debit equals credit', () => {
    renderTable(lines(1500.5, 1500.5));
    expect(screen.queryByText(/Selisih:/)).not.toBeInTheDocument();
  });

  it('shows no difference line when they differ by less than a cent', () => {
    renderTable(lines(100.004, 100));
    expect(screen.queryByText(/Selisih:/)).not.toBeInTheDocument();
  });

  it('shows the difference line at one cent apart', () => {
    renderTable(lines(100.01, 100));
    expect(screen.getByText(/Selisih:/)).toBeInTheDocument();
  });

  it('shows the difference line for a large gap', () => {
    renderTable(lines(1000, 900));
    expect(screen.getByText(/Selisih:/)).toBeInTheDocument();
  });
});
