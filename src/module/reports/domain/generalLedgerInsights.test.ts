import {
  buildBalanceSeries,
  groupAccountsMovement,
  groupMovement,
  percentOf,
  pickGranularity,
} from './generalLedgerInsights';
import type { GeneralLedgerTransaction } from './generalLedger.types';

const tx = (date: string, debit: number, credit: number, balance: number) =>
  ({
    transactionDate: `${date}T00:00:00.000Z`,
    transactionNumber: '1',
    description: '',
    notes: '',
    debit,
    credit,
    balance,
    journalId: '',
  }) as GeneralLedgerTransaction;

describe('buildBalanceSeries', () => {
  it('starts at the opening balance and keeps the last balance of each day', () => {
    const series = buildBalanceSeries(100, '2026-11-01', [
      tx('2026-11-03', 50, 0, 150),
      tx('2026-11-03', 0, 20, 130),
      tx('2026-11-02', 10, 0, 110),
    ]);
    expect(series).toEqual([
      { date: '2026-11-01', balance: 100 },
      { date: '2026-11-02', balance: 110 },
      { date: '2026-11-03', balance: 130 },
    ]);
  });

  it('is just the opening point when there is no movement', () => {
    expect(buildBalanceSeries(5, '2026-11-01', [])).toEqual([{ date: '2026-11-01', balance: 5 }]);
  });
});

describe('groupMovement', () => {
  const list = [tx('2026-11-02', 10, 0, 0), tx('2026-11-02', 0, 4, 0), tx('2026-12-01', 7, 0, 0)];

  it('groups by day', () => {
    expect(groupMovement(list, 'day')).toEqual([
      { key: '2026-11-02', debit: 10, credit: 4 },
      { key: '2026-12-01', debit: 7, credit: 0 },
    ]);
  });

  it('groups by month', () => {
    expect(groupMovement(list, 'month')).toEqual([
      { key: '2026-11', debit: 10, credit: 4 },
      { key: '2026-12', debit: 7, credit: 0 },
    ]);
  });
});

describe('pickGranularity', () => {
  it('uses days for a short period and months beyond two months', () => {
    expect(pickGranularity('2026-11-01', '2026-11-30')).toBe('day');
    expect(pickGranularity('2026-01-01', '2026-11-05')).toBe('month');
  });
});

describe('percentOf', () => {
  it('is a share from 0 to 100 and 0 for an empty whole', () => {
    expect(percentOf(25, 100)).toBe(25);
    expect(percentOf(150, 100)).toBe(100);
    expect(percentOf(5, 0)).toBe(0);
  });
});

describe('groupAccountsMovement', () => {
  it('adds up the movement of the accounts and skips parent accounts', () => {
    const account = (isHead: boolean, debit: number) =>
      ({ isHead, transactions: [tx('2026-11-02', debit, 0, 0)] }) as never;
    expect(
      groupAccountsMovement([account(false, 10), account(false, 5), account(true, 99)], 'day')
    ).toEqual([{ key: '2026-11-02', debit: 15, credit: 0 }]);
  });
});
