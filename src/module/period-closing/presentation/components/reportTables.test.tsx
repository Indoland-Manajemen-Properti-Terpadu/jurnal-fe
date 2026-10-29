import { vi } from 'vitest';
import { render, screen, within } from '@test-utils';
import BalanceSheetTable from './BalanceSheet/BalanceSheetTable';
import IncomeStatementTable from './IncomeStatement/IncomeStatementTable';
import TrialBalanceTable from './TrialBalanceTable';
import WorkingPaperTable from './WorkingPaperTable';

type Account = {
  id: string;
  name: string;
  accountNumber: string;
  amount: number;
  debit: number;
  credit: number;
  category: { name: string };
};

const mockState: { accounts: Account[] | undefined; isError: boolean } = {
  accounts: [],
  isError: false,
};

vi.mock('@/module/chart-of-accounts', () => ({
  useJournalAccounts: () => mockState,
}));

const account = (id: string, category: string, amount: number, debit = 0, credit = 0): Account => ({
  id,
  name: `Account ${id}`,
  accountNumber: `1-${id}`,
  amount,
  debit,
  credit,
  category: { name: category },
});

const rowOf = (label: string) => {
  const row = screen.getByText(label).closest('tr');
  if (!row) {
    throw new Error(`No row for ${label}`);
  }
  return row;
};

describe('period closing report tables (characterization)', () => {
  beforeEach(() => {
    mockState.accounts = [];
    mockState.isError = false;
  });

  describe('BalanceSheetTable', () => {
    it('sums the amounts of each category', () => {
      mockState.accounts = [
        account('1', 'Assets', 1000.5),
        account('2', 'Assets', 0.25),
        account('3', 'Liabilities', 2500),
      ];
      render(<BalanceSheetTable />);

      expect(within(rowOf('Total Assets')).getByText(/1\.000,75/)).toBeInTheDocument();
      expect(within(rowOf('Total Liabilities')).getByText(/2\.500,00/)).toBeInTheDocument();
    });

    it('does not show float noise for 0.1 + 0.2', () => {
      mockState.accounts = [account('1', 'Assets', 0.1), account('2', 'Assets', 0.2)];
      render(<BalanceSheetTable />);

      expect(within(rowOf('Total Assets')).getByText(/0,30/)).toBeInTheDocument();
    });

    it('treats a missing amount as zero and groups no category under Uncategorized', () => {
      mockState.accounts = [
        {
          ...account('1', 'x', 0),
          amount: undefined as unknown as number,
          category: undefined as never,
        },
        account('2', 'Assets', 10),
      ];
      render(<BalanceSheetTable />);

      expect(within(rowOf('Total Uncategorized')).getByText(/0,00/)).toBeInTheDocument();
    });

    it('shows the load error', () => {
      mockState.isError = true;
      render(<BalanceSheetTable />);

      expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    });
  });

  describe('IncomeStatementTable', () => {
    it('sums revenue, operating expenses and other revenue by category name', () => {
      mockState.accounts = [
        account('1', 'Sales Revenue', 1000.5),
        account('2', 'sales revenue', 0.25),
        account('3', 'Operating Expenses', 300),
        account('4', 'Other Revenue', 0.1),
        account('5', 'Other Revenue', 0.2),
        account('6', 'Assets', 999),
      ];
      render(<IncomeStatementTable />);

      expect(within(rowOf('Total Operating Revenue')).getByText(/1\.000,75/)).toBeInTheDocument();
      expect(within(rowOf('Total Operating Expenses')).getByText(/300,00/)).toBeInTheDocument();
      expect(within(rowOf('Total Non-Operating Income')).getByText(/0,30/)).toBeInTheDocument();
      expect(screen.queryByText(/Account 6/)).not.toBeInTheDocument();
    });

    it('keeps the fixed prototype figures', () => {
      mockState.accounts = [account('1', 'Sales Revenue', 10)];
      render(<IncomeStatementTable />);

      expect(within(rowOf('Total Cost of Revenue')).getByText(/50\.000,00/)).toBeInTheDocument();
      expect(
        within(rowOf('Total Non-Operating Expenses')).getByText(/30\.000,00/)
      ).toBeInTheDocument();
      expect(within(rowOf('Net Income')).getByText(/30\.000,00/)).toBeInTheDocument();
      expect(screen.getByText(/Total :/)).toHaveTextContent(/200,00/);
    });

    it('shows the load error', () => {
      mockState.isError = true;
      render(<IncomeStatementTable />);

      expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    });
  });

  describe('TrialBalanceTable', () => {
    it('lists debit and credit per account and a fixed zero total row', () => {
      mockState.accounts = [account('1', 'Assets', 5, 125.5, 0.3)];
      render(<TrialBalanceTable />);

      const row = rowOf('Account 1 (1-1)');
      expect(within(row).getAllByText(/125,50/)).toHaveLength(3);
      expect(within(row).getAllByText(/0,30/)).toHaveLength(3);
      expect(within(rowOf('Total')).getAllByText(/0,00/)).toHaveLength(6);
    });

    it('shows the load error', () => {
      mockState.isError = true;
      render(<TrialBalanceTable />);

      expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    });
  });

  describe('WorkingPaperTable', () => {
    it('lists debit and credit per account and a fixed zero total row', () => {
      mockState.accounts = [account('1', 'Assets', 5, 125.5, 0.3)];
      render(<WorkingPaperTable />);

      const row = rowOf('Account 1');
      expect(within(row).getAllByText(/125,50/)).toHaveLength(3);
      expect(within(rowOf('Total')).getAllByText(/0,00/)).toHaveLength(6);
    });

    it('shows the load error', () => {
      mockState.isError = true;
      render(<WorkingPaperTable />);

      expect(screen.getByText('Failed to load data.')).toBeInTheDocument();
    });
  });
});
