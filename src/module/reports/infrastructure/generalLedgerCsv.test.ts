import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { generalLedgerCsv } from './generalLedgerCsv';

const account: GeneralLedgerAccount = {
  id: 'a1',
  number: '1-10001',
  name: 'Kas',
  category: 'Kas & Bank',
  isContra: false,
  isHead: false,
  normalBalance: 'debit',
  openingBalance: 100,
  transactions: [
    {
      transactionDate: '2026-11-02',
      transactionNumber: '17009',
      description: '=SUM(1,2)',
      notes: 'Catatan',
      debit: 0,
      credit: 50,
      balance: 50,
      journalId: 'j1',
    },
  ],
  periodDebit: 0,
  periodCredit: 50,
  closingBalance: 50,
};

describe('generalLedgerCsv', () => {
  it('writes account identity on every journal row and protects spreadsheet cells', () => {
    const csv = generalLedgerCsv([account], 2, {
      columns: [
        'Kategori',
        'Kode akun',
        'Nama akun',
        'Tanggal',
        'No. jurnal',
        'Keterangan',
        'Catatan',
        'Debit',
        'Kredit',
        'Saldo',
      ],
      opening: 'Saldo awal',
      closing: 'Saldo akhir',
    });
    expect(csv).toContain(
      'Kategori,Kode akun,Nama akun,Tanggal,No. jurnal,Keterangan,Catatan,Debit,Kredit,Saldo'
    );
    expect(csv).toContain(
      'Kas & Bank,1-10001,Kas,2026-11-02,#17009,"\'=SUM(1,2)",Catatan,0.00,50.00,50.00'
    );
    expect(csv).toContain('Saldo awal');
    expect(csv).toContain('Saldo akhir');
  });
});
