import type { DraftLine } from './journalEntry';
import {
  absoluteDifference,
  holdsBothSides,
  isJournalBlocked,
  parseAmountInput,
  roundToMinor,
  sumAmounts,
  summarizeLines,
  validateDraft,
} from './journalRules';

const line = (account: string, debit: number, credit: number): DraftLine => ({
  account,
  description: '',
  debit,
  credit,
  key: `${account}-${debit}-${credit}`,
});

describe('parseAmountInput (form boundary)', () => {
  it('rounds half up to the cent', () => {
    expect(parseAmountInput('12.345')).toBe(12.35);
    expect(parseAmountInput(1.005)).toBe(1.01);
    expect(parseAmountInput('0.004')).toBe(0);
    expect(parseAmountInput(100.004)).toBe(100);
  });

  it('keeps whole rupiah and two-decimal amounts as they are', () => {
    expect(parseAmountInput(1500000)).toBe(1500000);
    expect(parseAmountInput('250000.5')).toBe(250000.5);
    expect(parseAmountInput(0.1 + 0.2)).toBe(0.3);
  });

  it('reads empty and invalid input as zero', () => {
    expect(parseAmountInput('')).toBe(0);
    expect(parseAmountInput('abc')).toBe(0);
    expect(parseAmountInput(NaN)).toBe(0);
    expect(parseAmountInput(undefined)).toBe(0);
  });

  it('converts to integer minor units', () => {
    expect(roundToMinor(19.99)).toBe(1999);
    expect(roundToMinor('0.29')).toBe(29);
  });
});

describe('sums on minor units', () => {
  it('has no float drift', () => {
    expect(sumAmounts([0.1, 0.2])).toBe(0.3);
    expect(sumAmounts([100.5, 50.25, 50.25])).toBe(201);
    expect(absoluteDifference(0.3, 0.1 + 0.2)).toBe(0);
    expect(absoluteDifference(100.01, 100)).toBe(0.01);
  });

  it('summarizes the form totals', () => {
    expect(summarizeLines([line('A', 0.1, 0), line('B', 0.2, 0), line('C', 0, 0.3)])).toEqual({
      totalDebit: 0.3,
      totalCredit: 0.3,
      difference: 0,
      isBalanced: true,
      hasValues: true,
    });
    expect(summarizeLines([line('A', 100, 0), line('B', 0, 99.99)])).toMatchObject({
      difference: 0.01,
      isBalanced: false,
    });
    expect(summarizeLines([line('A', 0, 0)])).toMatchObject({
      hasValues: false,
      isBalanced: false,
    });
  });
});

describe('I1 isJournalBlocked', () => {
  it('lets a balanced journal save', () => {
    expect(isJournalBlocked([line('A', 1000, 0), line('B', 0, 1000)])).toBe(false);
    expect(isJournalBlocked([line('A', 0.1, 0), line('B', 0.2, 0), line('C', 0, 0.3)])).toBe(false);
  });

  it('blocks one cent off, a missing account, a row without amount and a lone row', () => {
    expect(isJournalBlocked([line('A', 1000.01, 0), line('B', 0, 1000)])).toBe(true);
    expect(isJournalBlocked([line('A', 1000, 0), line('', 0, 1000)])).toBe(true);
    expect(isJournalBlocked([line('A', 1000, 0), line('B', 0, 1000), line('C', 0, 0)])).toBe(true);
    expect(isJournalBlocked([line('A', 1000, 0)])).toBe(true);
  });
});

describe('I2 one side per row', () => {
  it('detects a row that holds both sides', () => {
    expect(holdsBothSides(line('A', 10, 10))).toBe(true);
    expect(holdsBothSides(line('A', 10, 0))).toBe(false);
    expect(holdsBothSides(line('A', 0, 0))).toBe(false);
  });

  it('fails the amount check of the validation card for a row with both sides', () => {
    const checks = validateDraft([line('A', 10, 10), line('B', 0, 0)], '2026-05-01');
    expect(checks.allRowsHaveAmount).toBe(false);
    const ok = validateDraft([line('A', 10, 0), line('B', 0, 10)], '2026-05-01');
    expect(Object.values(ok).every(Boolean)).toBe(true);
  });

  it('needs a date, two rows and accounts', () => {
    expect(validateDraft([line('A', 10, 0), line('B', 0, 10)], '').hasDate).toBe(false);
    expect(validateDraft([line('A', 10, 0)], 'x').hasMinRows).toBe(false);
    expect(validateDraft([line('', 10, 0), line('B', 0, 10)], 'x').allAccountsSelected).toBe(false);
  });
});
