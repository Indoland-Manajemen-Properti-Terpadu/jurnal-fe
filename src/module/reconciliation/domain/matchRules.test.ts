import { describe, expect, it } from 'vitest';
import type { BankStatementData, JournalDetail } from './reconciliation';
import {
  buildMatch,
  canConfirmMatch,
  lineAmount,
  matchesBankDirection,
  recommendedBalance,
  resolveJournalDetailId,
  selectedTotal,
} from './matchRules';

const journal = (patch: Partial<JournalDetail> = {}): JournalDetail => ({
  id: 'j1',
  transactionDate: '2026-01-01',
  credit: 0,
  debit: 0,
  isReconciled: false,
  ...patch,
});

describe('I8 direction filter', () => {
  it('a positive bank amount matches only a line with a debit', () => {
    expect(matchesBankDirection(500, { debit: 500, credit: 0 })).toBe(true);
    expect(matchesBankDirection(500, { debit: 0, credit: 500 })).toBe(false);
  });

  it('a negative bank amount matches only a line with a credit', () => {
    expect(matchesBankDirection(-500, { debit: 0, credit: 500 })).toBe(true);
    expect(matchesBankDirection(-500, { debit: 500, credit: 0 })).toBe(false);
  });

  it('a zero bank amount matches every line, a missing side never matches', () => {
    expect(matchesBankDirection(0, { debit: 5, credit: 0 })).toBe(true);
    expect(matchesBankDirection(10, {})).toBe(false);
    expect(matchesBankDirection(-10, {})).toBe(false);
  });
});

describe('I8 match gate', () => {
  it('confirms only when the selected total equals the absolute bank amount', () => {
    expect(canConfirmMatch(1500.5, -1500.5)).toBe(true);
    expect(canConfirmMatch(1500.49, 1500.5)).toBe(false);
    expect(canConfirmMatch(1500.51, 1500.5)).toBe(false);
    expect(canConfirmMatch(0, 1500.5)).toBe(false);
  });

  it('absorbs float noise of a decimal sum', () => {
    const total = selectedTotal([journal({ debit: 0.1 }), journal({ debit: 0.2 })]);
    expect(total).not.toBe(0.3);
    expect(canConfirmMatch(total, 0.3)).toBe(true);
  });
});

describe('selected amounts', () => {
  it('counts debit, else credit, else 0', () => {
    expect(lineAmount({ debit: 10, credit: 0 })).toBe(10);
    expect(lineAmount({ debit: 0, credit: 7.25 })).toBe(7.25);
    expect(lineAmount({ debit: 0, credit: 0 })).toBe(0);
  });
});

describe('journal detail id per account', () => {
  it('sends the row id when the row has no transaction lines', () => {
    expect(resolveJournalDetailId(journal(), 'acc-1')).toBe('j1');
  });

  it('sends the line of the open account when the row carries transaction lines', () => {
    const row = journal({
      transactionDetail: [
        { id: 'd-other', account: 'acc-2' },
        { id: 'd-open', account: 'acc-1' },
      ],
    });
    expect(resolveJournalDetailId(row, 'acc-1')).toBe('d-open');
  });

  it('falls back to the row id when no line belongs to the open account', () => {
    const row = journal({ transactionDetail: [{ id: 'd-other', account: 'acc-2' }] });
    expect(resolveJournalDetailId(row, 'acc-1')).toBe('j1');
  });

  it('builds a match payload entry for a statement', () => {
    const rows = [
      journal({ id: 'a' }),
      journal({ id: 'b', transactionDetail: [{ id: 'd', account: 'x' }] }),
    ];
    expect(buildMatch({ id: 'bs-1' }, rows, 'x')).toEqual({
      bankStatementId: 'bs-1',
      journalDetailIds: ['a', 'd'],
    });
  });
});

describe('recommendedBalance', () => {
  const statement = (recs: [number, number][] | undefined): BankStatementData => ({
    id: 's',
    date: '2026-01-01',
    description: '',
    amount: 0,
    isReconciled: false,
    recommendations: recs?.map(([debit, credit]) => ({
      journalDetail: journal({ debit, credit }),
      fuzzyScore: 1,
      dayDifference: 0,
    })),
  });

  it('adds debit minus credit of the top recommendation only, exact in cents', () => {
    const balance = recommendedBalance([
      statement([
        [100.1, 0],
        [999, 0],
      ]),
      statement([[0, 40.2]]),
      statement([]),
      statement(undefined),
    ]);
    expect(balance).toBe(59.9);
  });

  it('sums decimals without float drift', () => {
    expect(recommendedBalance([statement([[0.1, 0]]), statement([[0.2, 0]])])).toBe(0.3);
  });

  it('falls back to the plain difference for more than two decimals', () => {
    expect(recommendedBalance([statement([[1.005, 0]])])).toBeCloseTo(1.005, 10);
  });
});
