import { MemoryRouter } from 'react-router-dom';
import { render, screen, within } from '@test-utils';
import type { DocumentJournal } from '@/module/purchases/domain/documentJournal';
import { DocumentJournalsCard } from './DocumentJournalsCard';

const journal = (overrides: Partial<DocumentJournal> = {}): DocumentJournal => ({
  id: 'j1',
  role: 'BILL',
  label: 'Verifikasi faktur',
  number: '25039',
  date: '2026-11-25',
  status: 'ACTIVE',
  statusLabel: 'Terposting',
  reversedById: null,
  notes: '',
  lines: [
    {
      accountNumber: '5-10001',
      accountName: 'Biaya Listrik',
      description: 'Faktur pembelian',
      debit: 420000,
      credit: 0,
    },
    {
      accountNumber: '2-20200',
      accountName: 'Hutang Lainnya',
      description: 'Faktur pembelian',
      debit: 0,
      credit: 420000,
    },
  ],
  totalDebit: 420000,
  totalCredit: 420000,
  ...overrides,
});

const renderCard = (journals: DocumentJournal[]) =>
  render(
    <MemoryRouter>
      <DocumentJournalsCard journals={journals} />
    </MemoryRouter>
  );

describe('DocumentJournalsCard', () => {
  it('says there is no journal yet for a document that posted none', () => {
    renderCard([]);

    expect(screen.getByText('Jurnal')).toBeInTheDocument();
    expect(screen.getByText('Belum ada jurnal')).toBeInTheDocument();
  });

  it('shows one table per journal with its accounts, debit and credit', () => {
    renderCard([journal()]);

    expect(screen.getByText('Verifikasi faktur')).toBeInTheDocument();
    expect(screen.getByText(/5-10001/)).toBeInTheDocument();
    expect(screen.getByText(/Hutang Lainnya/)).toBeInTheDocument();
    expect(screen.getAllByText(/420\.000/).length).toBeGreaterThanOrEqual(2);
  });

  it('links the journal number to the journal entry', () => {
    renderCard([journal()]);

    expect(screen.getByRole('link', { name: /25039/ })).toHaveAttribute(
      'href',
      '/general-journal/detail-transaction-journal/j1'
    );
  });

  it('shows the status of each journal, and which reverses a cancelled one', () => {
    renderCard([
      journal({ status: 'VOID', statusLabel: 'Dibatalkan', reversedById: 'j2' }),
      journal({
        id: 'j2',
        role: 'REVERSAL',
        label: 'Jurnal balik Pembayaran',
        number: '25040',
        status: 'REVERSAL',
        statusLabel: 'Jurnal balik',
      }),
    ]);

    expect(screen.getByText('Dibatalkan')).toBeInTheDocument();
    expect(screen.getByText('Jurnal balik')).toBeInTheDocument();
    const reversal = screen.getByText('Jurnal balik Pembayaran').closest('section');
    expect(reversal).not.toBeNull();
    expect(within(reversal as HTMLElement).getByText('Jurnal balik')).toBeInTheDocument();
  });

  it('shows the totals of a journal', () => {
    renderCard([journal()]);

    expect(screen.getByText('Total')).toBeInTheDocument();
  });
});
