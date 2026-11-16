import { resolvePrefill, withAccountPrefill } from './accountPrefill';

describe('withAccountPrefill', () => {
  it('adds the account as a query parameter', () => {
    expect(withAccountPrefill('/bank-cash/add-transfer-money', 'fromAccountId', 'acc-1')).toBe(
      '/bank-cash/add-transfer-money?fromAccountId=acc-1'
    );
  });

  it('encodes ids that contain reserved characters', () => {
    expect(withAccountPrefill('/bank-cash/add-receive-money', 'toAccountId', 'a b&c')).toBe(
      '/bank-cash/add-receive-money?toAccountId=a%20b%26c'
    );
  });
});

describe('resolvePrefill', () => {
  const selectable = [{ id: 'a1' }, { id: 'a3' }];

  it('keeps an account the form offers', () => {
    expect(resolvePrefill('a1', selectable)).toEqual({ accountId: 'a1', blocked: false });
  });

  it('refuses an account the form does not offer, such as a petty cash account', () => {
    expect(resolvePrefill('a2', selectable)).toEqual({ accountId: null, blocked: true });
  });

  it('does nothing when no account was asked for', () => {
    expect(resolvePrefill('', selectable)).toEqual({ accountId: null, blocked: false });
  });
});
