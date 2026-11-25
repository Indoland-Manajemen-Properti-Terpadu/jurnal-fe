import { toDocumentJournals } from './documentJournalMappers';

const journal = {
  id: 'j1',
  role: 'BILL',
  label: 'Verifikasi faktur',
  transactionNumber: 25039,
  referenceNumber: null,
  transactionDate: '2026-11-25T00:00:00.000Z',
  status: 'ACTIVE',
  statusLabel: 'Terposting',
  notes: 'Faktur pembelian FKT/2026/11/0012',
  reversedBy: null,
  lines: [
    {
      account: 'a1',
      accountNumber: '5-10001',
      accountName: 'Biaya Listrik',
      description: 'Faktur pembelian',
      debit: 420000,
      credit: 0,
    },
    {
      account: 'a2',
      accountNumber: '2-20200',
      accountName: 'Hutang Lainnya',
      description: 'Faktur pembelian',
      debit: 0,
      credit: 420000,
    },
  ],
  totalDebit: 420000,
  totalCredit: 420000,
};

describe('toDocumentJournals', () => {
  it('has no journals when the service sends none', () => {
    expect(toDocumentJournals(undefined)).toEqual([]);
    expect(toDocumentJournals(null)).toEqual([]);
    expect(toDocumentJournals([])).toEqual([]);
  });

  it('reads a journal with its lines and totals', () => {
    const [first] = toDocumentJournals([journal]);

    expect(first).toMatchObject({
      id: 'j1',
      role: 'BILL',
      label: 'Verifikasi faktur',
      number: '25039',
      date: '2026-11-25',
      status: 'ACTIVE',
      statusLabel: 'Terposting',
      reversedById: null,
      totalDebit: 420000,
      totalCredit: 420000,
    });
    expect(first.lines).toEqual([
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
    ]);
  });

  it('keeps the link from a cancelled journal to the one that reverses it', () => {
    const [cancelled, reversal] = toDocumentJournals([
      { ...journal, status: 'VOID', statusLabel: 'Dibatalkan', reversedBy: 'j2' },
      { ...journal, id: 'j2', role: 'REVERSAL', status: 'REVERSAL', statusLabel: 'Jurnal balik' },
    ]);

    expect(cancelled.reversedById).toBe('j2');
    expect(reversal.role).toBe('REVERSAL');
  });

  it('copes with a journal that has no lines or totals', () => {
    const [bare] = toDocumentJournals([{ id: 'j9', role: 'ADVANCE' }]);

    expect(bare).toMatchObject({ lines: [], totalDebit: 0, totalCredit: 0, number: '' });
  });
});
