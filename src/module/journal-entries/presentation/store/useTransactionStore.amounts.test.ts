import { useTransactionStore } from './useTransactionStore';

describe('useTransactionStore amount parsing (form boundary)', () => {
  beforeEach(() => useTransactionStore.getState().resetTransactions());

  it('rounds a typed amount half up to the cent', () => {
    useTransactionStore.getState().updateTransaction(0, 'debit', '12.345');
    expect(useTransactionStore.getState().transactions[0].debit).toBe(12.35);
  });

  it('turns an emptied field into zero', () => {
    const { updateTransaction } = useTransactionStore.getState();
    updateTransaction(0, 'debit', 50);
    updateTransaction(0, 'debit', '');
    expect(useTransactionStore.getState().transactions[0].debit).toBe(0);
  });

  it('sums the totals without float drift', () => {
    const { updateTransaction } = useTransactionStore.getState();
    updateTransaction(0, 'debit', 0.1);
    updateTransaction(1, 'debit', 0.2);
    expect(useTransactionStore.getState().totalDebit).toBe(0.3);
  });

  it('keeps text fields as typed', () => {
    useTransactionStore.getState().updateTransaction(0, 'description', 'sewa');
    expect(useTransactionStore.getState().transactions[0].description).toBe('sewa');
  });
});
