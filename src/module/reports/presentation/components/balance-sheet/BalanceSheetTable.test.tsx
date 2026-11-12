import { render, screen, userEvent, within } from '@test-utils';
import {
  BalanceSheetTable,
  type BalanceSheetGroup,
  type BalanceSheetSection,
} from './BalanceSheetTable';

const accounts = [
  {
    accountId: '1',
    accountNumber: '1-10000',
    accountName: 'Kas',
    categoryId: null,
    categoryName: 'Kas & Bank',
    balance: 600000,
  },
  {
    accountId: '2',
    accountNumber: '1-10003',
    accountName: 'Bank',
    categoryId: null,
    categoryName: null,
    balance: -13762000,
  },
];

const group = (overrides: Partial<BalanceSheetGroup> = {}): BalanceSheetGroup => ({
  key: 'current',
  title: 'Aset Lancar',
  accounts,
  subtotal: -100,
  ...overrides,
});

const section = (overrides: Partial<BalanceSheetSection> = {}): BalanceSheetSection => ({
  key: 'assets',
  title: 'Aset (Aktiva)',
  groups: [group()],
  closing: { label: 'Total Aset', value: 900 },
  ...overrides,
});

describe('BalanceSheetTable', () => {
  it('shows the subtotal in the group band and negative balances in parentheses', () => {
    render(<BalanceSheetTable sections={[section()]} searching={false} />);
    expect(screen.getByText('Kas')).toBeInTheDocument();
    expect(screen.getByText(/\(Rp\s?13\.762\.000,00\)/)).toBeInTheDocument();
    expect(screen.getByText(/\(Rp\s?100,00\)/)).toBeInTheDocument();
  });

  it('is one table: every section is a head inside it, in order, each with its own total row', () => {
    render(
      <BalanceSheetTable
        sections={[
          section(),
          section({
            key: 'liabilities',
            title: 'Liabilitas (Kewajiban)',
            groups: [],
            closing: { label: 'Total Liabilitas', value: 400 },
          }),
          section({
            key: 'equity',
            title: 'Ekuitas (Modal)',
            groups: [],
            closing: { label: 'Total Ekuitas', value: 500 },
          }),
        ]}
        searching={false}
      />
    );
    expect(screen.getAllByRole('table')).toHaveLength(1);
    const heads = ['Aset (Aktiva)', 'Liabilitas (Kewajiban)', 'Ekuitas (Modal)'].map((title) =>
      screen.getByText(title)
    );
    heads.forEach((head, index) => {
      if (index > 0) {
        expect(
          heads[index - 1].compareDocumentPosition(head) & Node.DOCUMENT_POSITION_FOLLOWING
        ).toBeTruthy();
      }
    });
  });

  it('ends every section with its total row and the table with the grand total', () => {
    render(
      <BalanceSheetTable
        sections={[section()]}
        grandTotal={{ label: 'Total Liabilitas + Ekuitas', value: 900 }}
        searching={false}
      />
    );
    const row = screen.getByText('Total Aset').closest('tr')!;
    expect(within(row).getByText(/Rp\s?900/)).toBeInTheDocument();
    const grand = screen.getByText('Total Liabilitas + Ekuitas').closest('tr')!;
    expect(within(grand).getByText(/Rp\s?900/)).toBeInTheDocument();
  });

  it('puts no figure in a section head, the total is in the row under it', () => {
    render(<BalanceSheetTable sections={[section({ groups: [] })]} searching={false} />);
    const head = screen.getByText('Aset (Aktiva)').closest('tr')!;
    expect(within(head).queryByText(/Rp/)).not.toBeInTheDocument();
  });

  it('collapses the accounts of a group but keeps its subtotal visible', async () => {
    render(
      <BalanceSheetTable
        sections={[section({ groups: [group({ subtotal: 500 })] })]}
        searching={false}
      />
    );
    const band = screen.getByRole('button', { name: /Aset Lancar/ });
    expect(band).toHaveAttribute('aria-expanded', 'true');
    await userEvent.click(band);
    expect(band).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByText('Kas')).not.toBeInTheDocument();
    expect(screen.getByText(/Rp\s?500/)).toBeInTheDocument();
  });

  it('shows accounts of a flat section without a group band', () => {
    render(<BalanceSheetTable sections={[section({ flat: true })]} searching={false} />);
    expect(screen.getByText('Kas')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Aset Lancar/ })).not.toBeInTheDocument();
  });

  it('drops a group with no match while searching, and says so when nothing is left', () => {
    const empty = group({ key: 'empty', title: 'Penyusutan', accounts: [], subtotal: 0 });
    const { unmount } = render(
      <BalanceSheetTable sections={[section({ groups: [empty, group()] })]} searching />
    );
    expect(screen.queryByText('Penyusutan')).not.toBeInTheDocument();
    expect(screen.getByText('Aset Lancar')).toBeInTheDocument();
    unmount();

    render(<BalanceSheetTable sections={[section({ groups: [empty] })]} searching />);
    expect(screen.getByText(/yang cocok dengan pencarian/)).toBeInTheDocument();
  });

  it('notes an empty group when not searching', () => {
    const empty = group({ key: 'empty', title: 'Penyusutan', accounts: [], subtotal: 0 });
    render(<BalanceSheetTable sections={[section({ groups: [empty] })]} searching={false} />);
    expect(screen.getByText('Penyusutan')).toBeInTheDocument();
    expect(screen.getByText(/akun tercatat/)).toBeInTheDocument();
  });
});
