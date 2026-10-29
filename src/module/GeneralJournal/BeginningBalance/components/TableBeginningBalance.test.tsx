import { vi } from 'vitest';
import { fireEvent, render, screen } from '@test-utils';
import TableBeginningBalance, { isNormalDebit } from './TableBeginningBalance';
import { JournalAccounts } from '../../JournalAccount/types/JournalAccountModel';

type MockColumn = { accessor: string; render?: (item: JournalAccounts) => React.ReactNode };

// jsdom does not lay out mantine-datatable rows; render each column cell directly instead.
vi.mock('mantine-datatable', () => ({
  DataTable: ({ records, columns }: { records: JournalAccounts[]; columns: MockColumn[] }) => (
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

describe('I5 isNormalDebit in TableBeginningBalance (characterization)', () => {
  it('uses the backend flag first, even against a credit keyword', () => {
    expect(isNormalDebit('Hutang Usaha', true)).toBe(true);
    expect(isNormalDebit('Kas', false)).toBe(false);
  });

  it.each(['kewajiban', 'hutang', 'liabilitas', 'modal', 'ekuitas', 'pendapatan', 'penjualan'])(
    'falls back to credit for the keyword %s, in any case',
    (word) => {
      expect(isNormalDebit(word)).toBe(false);
      expect(isNormalDebit(`Total ${word.toUpperCase()} Lancar`)).toBe(false);
    }
  );

  it('falls back to debit for other or empty categories', () => {
    expect(isNormalDebit('Kas & Bank')).toBe(true);
    expect(isNormalDebit('Beban Gaji')).toBe(true);
    expect(isNormalDebit('')).toBe(true);
    expect(isNormalDebit(undefined)).toBe(true);
  });

  it('has no contra handling', () => {
    expect(isNormalDebit('Kas', undefined)).toBe(true);
  });
});

const account = (over: Partial<JournalAccounts> = {}): JournalAccounts => ({
  id: 'acc-1',
  name: 'Kas',
  accountNumber: '1-1000',
  amount: 0,
  debit: 0,
  credit: 0,
  category: { name: 'Aset', isDebit: true },
  ...over,
});

describe('I4 integer-only entry in TableBeginningBalance (characterization)', () => {
  const setup = (data: JournalAccounts[]) => {
    const onChange = vi.fn();
    render(<TableBeginningBalance data={data} onChange={onChange} />);
    const inputs = screen.getAllByPlaceholderText(/^0/);
    return { onChange, debitInput: inputs[0], creditInput: inputs[1] };
  };

  it('strips every non digit, so decimals are read as a larger integer', () => {
    const { onChange, debitInput } = setup([account()]);
    fireEvent.change(debitInput, { target: { value: '1.500,50' } });
    expect(onChange.mock.calls[0][0][0].debit).toBe(150050);
  });

  it('reads letters only as zero', () => {
    const { onChange, debitInput } = setup([account({ debit: 10 })]);
    fireEvent.change(debitInput, { target: { value: 'abc' } });
    expect(onChange.mock.calls[0][0][0].debit).toBe(0);
  });

  it('clears the opposite side when a value above zero is typed', () => {
    const { onChange, debitInput } = setup([account({ credit: 400 })]);
    fireEvent.change(debitInput, { target: { value: '250' } });
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ debit: 250, credit: 0 });
  });

  it('keeps the opposite side when the typed value is zero', () => {
    const { onChange, creditInput } = setup([account({ debit: 300 })]);
    fireEvent.change(creditInput, { target: { value: '0' } });
    expect(onChange.mock.calls[0][0][0]).toMatchObject({ debit: 300, credit: 0 });
  });
});
