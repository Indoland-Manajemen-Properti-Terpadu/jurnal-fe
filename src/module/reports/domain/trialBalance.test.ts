import type { TrialBalanceAccount } from './trialBalance.types';
import {
  detailTrialBalanceAccounts,
  filterTrialBalanceAccounts,
  groupTrialBalanceAccounts,
} from './trialBalance';

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

describe('detailTrialBalanceAccounts', () => {
  const acct = (accountNumber: string, isHead = false) =>
    ({ id: accountNumber, accountNumber, name: accountNumber, isHead }) as TrialBalanceAccount;

  it('leaves out the parent accounts and keeps sub and standalone accounts in order', () => {
    const shown = detailTrialBalanceAccounts([
      acct('1-10000', true),
      acct('1-10001'),
      acct('1-10100', true),
      acct('1-10200'),
    ]);
    expect(shown.map((item) => item.accountNumber)).toEqual(['1-10001', '1-10200']);
  });
});

describe('groupTrialBalanceAccounts', () => {
  const acct = (accountNumber: string) => ({ accountNumber }) as TrialBalanceAccount;

  it('groups by the first digit in chart order and leaves out empty classes', () => {
    const sections = groupTrialBalanceAccounts([
      acct('2-1'),
      acct('1-1'),
      acct('1-2'),
      acct('6-1'),
    ]);
    expect(sections.map((section) => section.key)).toEqual(['1', '2', '6']);
    expect(sections[0].accounts.map((item) => item.accountNumber)).toEqual(['1-1', '1-2']);
  });

  it('keeps an account with an unknown first digit in its own group, last', () => {
    const sections = groupTrialBalanceAccounts([acct('X-1'), acct('1-1')]);
    expect(sections.map((section) => section.key)).toEqual(['1', 'other']);
  });
});
