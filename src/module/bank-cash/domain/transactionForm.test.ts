import { describe, expect, it } from 'vitest';
import {
  receiveMissing,
  sentMissing,
  transferMissing,
  receivePreview,
  sentPreview,
  transferPreview,
  balanceAfterReceive,
  todayWib,
} from '@/module/bank-cash/domain/transactionForm';

const line = (accountId: string, amount: number) => ({ accountId, amount });

describe('missing reasons', () => {
  it('names every missing part of a receipt, in the order the form is filled', () => {
    expect(receiveMissing({ date: '', accountId: null, lines: [line('', 0)] })).toEqual([
      'account',
      'date',
      'lines',
    ]);
  });

  it('is complete when the account, the date and every line are filled', () => {
    expect(
      receiveMissing({ date: '2026-11-12', accountId: 'cash', lines: [line('rev', 50_000)] })
    ).toEqual([]);
  });

  it('wants a positive amount and an account on every line', () => {
    expect(sentMissing({ date: '2026-11-12', accountId: 'cash', lines: [line('exp', 0)] })).toEqual(
      ['lines']
    );
    expect(sentMissing({ date: '2026-11-12', accountId: 'cash', lines: [line('', 10)] })).toEqual([
      'lines',
    ]);
    expect(
      sentMissing({
        date: '2026-11-12',
        accountId: 'cash',
        lines: [line('exp', 10), line('exp2', 0)],
      })
    ).toEqual(['lines']);
  });

  it('refuses the same account on both sides of a transfer', () => {
    expect(transferMissing({ date: '2026-11-12', fromId: 'a', toId: 'a', amount: 10 })).toEqual([
      'sameAccount',
    ]);
  });

  it('lists what a blank transfer still needs', () => {
    expect(transferMissing({ date: '2026-11-12', fromId: null, toId: null, amount: 0 })).toEqual([
      'fromAccount',
      'toAccount',
      'amount',
    ]);
  });
});

describe('journal preview', () => {
  it('debits the cash account and credits each source of a receipt', () => {
    const preview = receivePreview('Kas Besar', [
      { name: 'Pendapatan Bunga', amount: 0.1 },
      { name: 'Modal', amount: 0.2 },
    ]);
    expect(preview.lines).toEqual([
      { account: 'Kas Besar', debit: 0.3 },
      { account: 'Pendapatan Bunga', credit: 0.1 },
      { account: 'Modal', credit: 0.2 },
    ]);
    expect(preview.balanced).toBe(true);
  });

  it('debits each expense and credits the paying account last', () => {
    const preview = sentPreview('Bank BCA', [
      { name: 'Beban Listrik', amount: 300_000 },
      { name: 'Beban ATK', amount: 50_000 },
    ]);
    expect(preview.lines).toEqual([
      { account: 'Beban Listrik', debit: 300_000 },
      { account: 'Beban ATK', debit: 50_000 },
      { account: 'Bank BCA', credit: 350_000 },
    ]);
    expect(preview.balanced).toBe(true);
  });

  it('debits the destination and credits the source of a transfer', () => {
    expect(transferPreview('Bank BCA', 'Kas Besar', 1_000_000).lines).toEqual([
      { account: 'Kas Besar', debit: 1_000_000 },
      { account: 'Bank BCA', credit: 1_000_000 },
    ]);
  });

  it('leaves out lines that have no account or no amount yet', () => {
    const preview = sentPreview('Bank BCA', [
      { name: '', amount: 5 },
      { name: 'Beban ATK', amount: 0 },
    ]);
    expect(preview.lines).toEqual([]);
  });
});

describe('balanceAfterReceive', () => {
  it('adds the amount cent-exact', () => {
    expect(balanceAfterReceive(0.1, 0.2)).toBe(0.3);
    expect(balanceAfterReceive(-1_000, 400)).toBe(-600);
  });
});

describe('todayWib', () => {
  it('reads the calendar date in Jakarta, not in UTC', () => {
    expect(todayWib(new Date('2026-11-12T20:00:00Z'))).toBe('2026-11-13');
    expect(todayWib(new Date('2026-11-12T16:59:00Z'))).toBe('2026-11-12');
  });
});
