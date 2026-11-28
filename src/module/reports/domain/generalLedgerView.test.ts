import type { GeneralLedgerAccount } from './generalLedger.types';
import { selectLedgerAccounts } from './generalLedgerView';

const account = (overrides: Partial<GeneralLedgerAccount> = {}): GeneralLedgerAccount => ({
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
      description: 'Pembayaran Vendor',
      notes: 'Pelunasan faktur',
      debit: 0,
      credit: 50,
      balance: 50,
      journalId: 'j1',
    },
  ],
  periodDebit: 0,
  periodCredit: 50,
  closingBalance: 50,
  ...overrides,
});

describe('selectLedgerAccounts', () => {
  it('shows a full account when its code matches and only matching rows when a journal matches', () => {
    const source = [
      account({
        transactions: [
          ...account().transactions,
          {
            ...account().transactions[0],
            transactionNumber: '17010',
            description: 'Faktur penjualan',
            journalId: 'j2',
          },
        ],
      }),
    ];
    expect(selectLedgerAccounts(source, '1-10001', true)[0].transactions).toHaveLength(2);
    const journal = selectLedgerAccounts(source, '#17009', true)[0];
    expect(journal.transactions.map((row) => row.transactionNumber)).toEqual(['17009']);
    expect(journal.filteredRows).toBe(true);
    expect(journal.account.closingBalance).toBe(50);
  });

  it('hides accounts without period transactions only when requested', () => {
    const empty = account({ id: 'a2', transactions: [], periodCredit: 0 });
    expect(selectLedgerAccounts([empty], '', true)).toHaveLength(0);
    expect(selectLedgerAccounts([empty], '', false)).toHaveLength(1);
  });
});
