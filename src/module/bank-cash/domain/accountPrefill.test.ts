import { withAccountPrefill } from './accountPrefill';

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
