import { vi } from 'vitest';
import { fireEvent, render, screen } from '@test-utils';
import type { OpeningRow } from '../../domain/beginningBalance';
import TableBeginningBalance from './TableBeginningBalance';

type MockColumn = { accessor: string; render?: (item: OpeningRow) => React.ReactNode };

// jsdom does not lay out mantine-datatable rows; render each column cell directly instead.
vi.mock('mantine-datatable', () => ({
  DataTable: ({ records, columns }: { records: OpeningRow[]; columns: MockColumn[] }) => (
    <div>
      {records.map((record) => (
        <div key={record.id}>
          {columns.map((col) => (
            <div key={col.accessor}>{col.render ? col.render(record) : null}</div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

const row = (over: Partial<OpeningRow> = {}): OpeningRow => ({
  id: 'acc-1',
  name: 'Kas',
  accountNumber: '1-1000',
  normalSide: 'debit',
  isContra: false,
  debit: 0,
  credit: 0,
  ...over,
});

describe('TableBeginningBalance', () => {
  const setup = (records: OpeningRow[]) => {
    const onEnter = vi.fn();
    const onClear = vi.fn();
    render(<TableBeginningBalance records={records} onEnter={onEnter} onClear={onClear} />);
    return { onEnter, onClear };
  };

  it('hands the typed text to the page, which parses it', () => {
    const { onEnter } = setup([row()]);
    fireEvent.change(screen.getByLabelText('Debit (Rp) 1-1000'), { target: { value: '1.500,50' } });
    expect(onEnter).toHaveBeenCalledWith('acc-1', 'debit', '1.500,50');
  });

  it('puts the thousands dots in while typing, and passes the formatted text on', () => {
    const { onEnter } = setup([row()]);
    const input = screen.getByLabelText('Debit (Rp) 1-1000');
    fireEvent.change(input, { target: { value: '200000' } });
    expect(input).toHaveValue('200.000');
    expect(onEnter).toHaveBeenLastCalledWith('acc-1', 'debit', '200.000');
  });

  it('keeps what is being typed visible while it is incomplete (a trailing comma)', () => {
    setup([row()]);
    const input = screen.getByLabelText('Debit (Rp) 1-1000');
    fireEvent.change(input, { target: { value: '1.500,' } });
    expect(input).toHaveValue('1.500,');
  });

  it('shows the saved amount formatted', () => {
    setup([row({ debit: 1500000 })]);
    expect(screen.getByLabelText('Debit (Rp) 1-1000')).toHaveValue('1.500.000');
  });

  it('names the normal side and the contra flag of the account', () => {
    setup([row({ normalSide: 'credit', isContra: true })]);
    expect(screen.getByText(/Saldo normal kredit · akun kontra/)).toBeInTheDocument();
  });

  it('notes an amount on the side the account does not normally grow on', () => {
    setup([row({ credit: 10 })]);
    expect(screen.getByText('Di luar sisi normal')).toBeInTheDocument();
  });

  it('offers to clear a row only when it has an amount', () => {
    const { onClear } = setup([
      row({ id: 'a', debit: 5 }),
      row({ id: 'b', accountNumber: '1-2000' }),
    ]);
    expect(screen.queryByLabelText(/Kosongkan baris ini 1-2000/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(/Kosongkan baris ini 1-1000/));
    expect(onClear).toHaveBeenCalledWith('a');
  });

  it('shows one page of the rows, so the whole chart is reached by paging, not by an inner scroll', () => {
    const many = Array.from({ length: 30 }, (_, i) =>
      row({ id: `r${i}`, accountNumber: `1-${10000 + i}` })
    );
    setup(many);
    expect(screen.getAllByLabelText(/^Debit \(Rp\)/)).toHaveLength(25);
  });
});
