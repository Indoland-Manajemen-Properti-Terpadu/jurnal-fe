import type { TrialBalanceAccount, TrialBalanceReport } from './trialBalance.types';
import { filterTrialBalanceAccounts, isTrialBalanceBalanced } from './trialBalance';

const sums = (debit: number, credit: number) => ({ debit, credit });
const reportWith = (debit: number, credit: number) =>
  ({
    totals: { closing: sums(debit, credit) },
  }) as unknown as TrialBalanceReport;
const account = (accountNumber: string, name: string) =>
  ({ accountNumber, name }) as TrialBalanceAccount;

describe('isTrialBalanceBalanced', () => {
  it('is balanced when closing debit and credit are equal', () => {
    expect(isTrialBalanceBalanced(reportWith(24000000, 24000000))).toBe(true);
    expect(isTrialBalanceBalanced(reportWith(100.001, 100))).toBe(true);
  });

  it('is not balanced when they differ', () => {
    expect(isTrialBalanceBalanced(reportWith(100, 99))).toBe(false);
  });
});

describe('filterTrialBalanceAccounts', () => {
  const accounts = [account('1-10001', 'Kas Kecil'), account('4-10001', 'Pendapatan IPL')];

  it('matches the number or the name, ignoring case', () => {
    expect(filterTrialBalanceAccounts(accounts, 'kas')).toHaveLength(1);
    expect(filterTrialBalanceAccounts(accounts, '4-100')[0].name).toBe('Pendapatan IPL');
  });

  it('returns every account for a blank search', () => {
    expect(filterTrialBalanceAccounts(accounts, '  ')).toBe(accounts);
  });
});
