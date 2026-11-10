import type { TrialBalanceAccount, TrialBalanceReport } from './trialBalance.types';
import { filterTrialBalanceAccounts, profitMargin } from './trialBalance';

const account = (accountNumber: string, name: string) =>
  ({ accountNumber, name }) as TrialBalanceAccount;

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

describe('profitMargin', () => {
  const report = (credit: number, profit: number) =>
    ({ totals: { profitLoss: { debit: 0, credit } }, profit }) as TrialBalanceReport;

  it('is the profit as a percentage of the revenue side', () => {
    expect(profitMargin(report(200, 50))).toBe(25);
    expect(profitMargin(report(200, -50))).toBe(-25);
  });

  it('is null when there is no revenue', () => {
    expect(profitMargin(report(0, 0))).toBeNull();
  });
});
