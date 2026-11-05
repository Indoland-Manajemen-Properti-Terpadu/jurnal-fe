import { mapGeneralLedgerResponse } from './generalLedgerMapper';

describe('mapGeneralLedgerResponse', () => {
  it('maps accounts, transactions and string amounts', () => {
    const result = mapGeneralLedgerResponse({
      data: {
        periodDebitTotal: '1500.50',
        periodCreditTotal: 1500.5,
        accounts: [
          {
            account: { id: 'a1', accountNumber: '1-1000', name: 'Kas', category: { name: 'Aset' } },
            openingBalance: '100',
            closingBalance: 200,
            transactions: [{ transactionNumber: 'J-1', debit: '100.25', credit: 0, balance: 200 }],
          },
        ],
      },
    });

    expect(result.periodDebitTotal).toBe(1500.5);
    expect(result.accounts[0]).toMatchObject({
      id: 'a1',
      number: '1-1000',
      name: 'Kas',
      category: 'Aset',
      openingBalance: 100,
      closingBalance: 200,
    });
    expect(result.accounts[0].transactions[0]).toMatchObject({
      transactionNumber: 'J-1',
      description: '-',
      debit: 100.25,
    });
  });

  it('falls back to defaults for missing names and categories', () => {
    const result = mapGeneralLedgerResponse({ accounts: [{}] });

    expect(result.accounts[0]).toMatchObject({
      number: '-',
      name: 'Akun Tanpa Nama',
      category: 'Lainnya',
      isContra: false,
    });
  });

  it('exposes the period lock only when the server sends one', () => {
    expect(mapGeneralLedgerResponse({ accounts: [] })).toMatchObject({
      periodLockName: null,
      periodLockType: null,
    });
    expect(
      mapGeneralLedgerResponse({ periodLockInfo: { name: 'Jan', type: 'HARD' } })
    ).toMatchObject({ periodLockName: 'Jan', periodLockType: 'HARD' });
  });

  it('returns an empty report for an empty payload', () => {
    expect(mapGeneralLedgerResponse(null)).toEqual({
      accounts: [],
      pagination: { page: 1, limit: 0, totalAccounts: 0, totalPages: 1 },
      periodDebitTotal: 0,
      periodCreditTotal: 0,
      periodLockName: null,
      periodLockType: null,
    });
  });

  it('reads the account page, the parent flag and the memo', () => {
    const result = mapGeneralLedgerResponse({
      data: {
        pagination: { page: 2, limit: 20, totalAccounts: 66, totalPages: 4 },
        accounts: [
          {
            account: { id: 'a1', isHead: true, normalBalance: 'credit' },
            transactions: [{ notes: 'Memo panjang' }],
          },
        ],
      },
    });

    expect(result.pagination).toEqual({ page: 2, limit: 20, totalAccounts: 66, totalPages: 4 });
    expect(result.accounts[0]).toMatchObject({ isHead: true, normalBalance: 'credit' });
    expect(result.accounts[0].transactions[0].notes).toBe('Memo panjang');
  });

  it('treats a response without paging as a single page of all accounts', () => {
    const result = mapGeneralLedgerResponse({ accounts: [{}, {}] });
    expect(result.pagination).toEqual({ page: 1, limit: 2, totalAccounts: 2, totalPages: 1 });
  });
});
