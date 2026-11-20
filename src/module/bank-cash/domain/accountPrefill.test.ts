import { resolvePrefill, safeReturnTo, withAccountPrefill } from './accountPrefill';

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

describe('withAccountPrefill with a way back', () => {
  it('adds where to return to after saving', () => {
    expect(
      withAccountPrefill(
        '/bank-cash/add-receive-money',
        'toAccountId',
        'a1',
        '/general-journal/detail-account-cb/a1'
      )
    ).toBe(
      '/bank-cash/add-receive-money?toAccountId=a1&returnTo=%2Fgeneral-journal%2Fdetail-account-cb%2Fa1'
    );
  });
});

describe('safeReturnTo', () => {
  it('keeps a path inside the app', () => {
    expect(safeReturnTo('/general-journal/detail-account-cb/a1')).toBe(
      '/general-journal/detail-account-cb/a1'
    );
  });

  it('falls back when nothing was asked for', () => {
    expect(safeReturnTo(null)).toBeNull();
    expect(safeReturnTo('')).toBeNull();
  });

  it('refuses an address that would leave the app', () => {
    expect(safeReturnTo('https://example.com')).toBeNull();
    expect(safeReturnTo('//example.com')).toBeNull();
    expect(safeReturnTo('/\\example.com')).toBeNull();
  });
});
