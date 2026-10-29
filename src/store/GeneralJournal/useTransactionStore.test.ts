import { useTransactionStore } from './useTransactionStore';

type Row = { account: string; description: string; debit: number; credit: number; key: string };

const row = (account: string, debit: number, credit: number, key = account): Row => ({
  account,
  description: '',
  debit,
  credit,
  key,
});

const setRows = (transactions: Row[]) => useTransactionStore.setState({ transactions });
const isBlocked = () => useTransactionStore.getState().disableTransaction();

describe('I1 useTransactionStore.disableTransaction (characterization)', () => {
  it('lets a balanced two-row journal save', () => {
    setRows([row('A', 1000, 0), row('B', 0, 1000)]);
    expect(isBlocked()).toBe(false);
  });

  it('lets a balanced multi-row journal with cents save', () => {
    setRows([row('A', 100.5, 0), row('B', 0, 50.25), row('C', 0, 50.25)]);
    expect(isBlocked()).toBe(false);
  });

  it('blocks a journal that is off by one cent', () => {
    setRows([row('A', 1000.01, 0), row('B', 0, 1000)]);
    expect(isBlocked()).toBe(true);
    setRows([row('A', 1000, 0), row('B', 0, 1000.01)]);
    expect(isBlocked()).toBe(true);
  });

  it('blocks when any row has no account', () => {
    setRows([row('A', 1000, 0), row('', 0, 1000, 'empty')]);
    expect(isBlocked()).toBe(true);
  });

  it('blocks when any row has both amounts zero', () => {
    setRows([row('A', 1000, 0), row('B', 0, 1000), row('C', 0, 0)]);
    expect(isBlocked()).toBe(true);
  });

  it('blocks a single row that holds only one side', () => {
    setRows([row('A', 1000, 0)]);
    expect(isBlocked()).toBe(true);
  });

  it('does not itself enforce the two-row minimum: no rows is not blocked', () => {
    setRows([]);
    expect(isBlocked()).toBe(false);
  });

  it('does not itself enforce the two-row minimum: one row with equal sides is not blocked', () => {
    setRows([row('A', 500, 500)]);
    expect(isBlocked()).toBe(false);
  });

  it('parses string amounts the way parseFloat does', () => {
    useTransactionStore.setState({
      transactions: [
        { ...row('A', 0, 0), debit: '250' as unknown as number },
        { ...row('B', 0, 0), credit: '250.00' as unknown as number },
      ],
    });
    expect(isBlocked()).toBe(false);
  });

  it('blocks when an amount is not a number', () => {
    useTransactionStore.setState({
      transactions: [row('A', 100, 0), { ...row('B', 0, 0), credit: NaN }],
    });
    expect(isBlocked()).toBe(true);
  });
});
