import { act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { fireEvent, render, screen } from '@test-utils';
import { useI18nStore } from '@/i18n/store';
import ClosingBooksPage from './ClosingBooksPage';
import FinancialStatementPage from './FinancialStatementPage';
import PeriodClosingListPage from './PeriodClosingListPage';
import { PeriodAndClosingBooksModal } from '../components/PeriodAndClosingBooksModal';

const navigate = vi.fn();

vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual<typeof import('react-router-dom')>('react-router-dom')),
  useNavigate: () => navigate,
}));

vi.mock('@/components/AppShellLayout', () => ({
  default: ({ children, footer }: { children: React.ReactNode; footer?: React.ReactNode }) => (
    <div>
      {children}
      {footer}
    </div>
  ),
}));

vi.mock('@/module/chart-of-accounts', () => ({
  useJournalAccounts: () => ({
    accounts: [
      {
        id: 'a1',
        name: 'Kas',
        accountNumber: '1-1',
        amount: 100,
        debit: 100,
        credit: 0,
        category: { name: 'Sales Revenue' },
      },
    ],
    isError: false,
  }),
}));

const inRouter = (node: React.ReactNode) => render(<MemoryRouter>{node}</MemoryRouter>);

describe('period closing pages', () => {
  beforeEach(() => navigate.mockClear());
  afterEach(() => act(() => useI18nStore.getState().setLanguage('id')));

  describe('ClosingBooksPage', () => {
    it('renders in Indonesian and continues to the financial statement', () => {
      inRouter(<ClosingBooksPage />);

      expect(screen.getByText('Kertas Kerja Neraca Saldo')).toBeInTheDocument();
      expect(screen.getByText('Dari awal sampai 31/07/2024')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Lanjutkan' }));
      expect(navigate).toHaveBeenCalledWith('/settings/general-journal/period-lock/financial-statement');
    });

    it('renders in English and goes back to the general journal', () => {
      act(() => useI18nStore.getState().setLanguage('en'));
      inRouter(<ClosingBooksPage />);

      expect(screen.getByText('Trial Balance Working Paper')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(navigate).toHaveBeenCalledWith('/general-journal');
    });
  });

  describe('FinancialStatementPage', () => {
    it('renders the four tabs in Indonesian', () => {
      inRouter(<FinancialStatementPage />);

      expect(screen.getByText('Laporan Keuangan')).toBeInTheDocument();
      ['Neraca Saldo', 'Laporan Laba Rugi', 'Neraca', 'Arus Kas'].forEach((label) => {
        expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Konfirmasi' }));
      expect(navigate).toHaveBeenCalledWith('/settings/general-journal/closing-books/list/period-lock');
    });

    it('renders the four tabs in English and goes back', () => {
      act(() => useI18nStore.getState().setLanguage('en'));
      inRouter(<FinancialStatementPage />);

      ['Trial Balance', 'Income Statement', 'Balance Sheet', 'Cash Flow'].forEach((label) => {
        expect(screen.getByRole('tab', { name: label })).toBeInTheDocument();
      });
      fireEvent.click(screen.getByRole('button', { name: 'Back' }));
      expect(navigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('PeriodClosingListPage', () => {
    it('opens the draft modal', async () => {
      inRouter(<PeriodClosingListPage />);

      expect(screen.getByText('Daftar Kunci Periode & Tutup Buku')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Mulai Tutup Buku' }));
      expect(await screen.findByText('Batalkan atau Simpan sebagai draf')).toBeInTheDocument();
    });

    it('renders in English', () => {
      act(() => useI18nStore.getState().setLanguage('en'));
      inRouter(<PeriodClosingListPage />);

      expect(screen.getByText('List Period Lock & Closing the Books')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Add Period Lock' })).toBeInTheDocument();
    });
  });

  describe('PeriodAndClosingBooksModal', () => {
    it('shows the intro in Indonesian', async () => {
      inRouter(<PeriodAndClosingBooksModal opened onClose={vi.fn()} />);
      expect(await screen.findByText('Fungsi Kunci Periode & Tutup Buku')).toBeInTheDocument();
    });

    it('shows the intro in English', async () => {
      act(() => useI18nStore.getState().setLanguage('en'));
      inRouter(<PeriodAndClosingBooksModal opened onClose={vi.fn()} />);
      expect(await screen.findByText('Period Lock & Closing Books Functionality')).toBeInTheDocument();
    });
  });
});
