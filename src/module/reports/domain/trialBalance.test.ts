import type { TrialBalanceAccount } from './trialBalance.types';
import { filterTrialBalanceAccounts } from './trialBalance';

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
