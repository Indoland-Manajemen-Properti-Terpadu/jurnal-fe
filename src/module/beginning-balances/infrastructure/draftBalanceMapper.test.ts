import { toDateLocked, toDraftBalance, toSimpleAccounts } from './draftBalanceMapper';

describe('toDraftBalance', () => {
  it('unwraps the { data } envelope', () => {
    expect(toDraftBalance({ data: { id: 'd1', accounts: [] } })).toEqual({
      id: 'd1',
      accounts: [],
    });
  });

  it('accepts the bare draft, including the "no draft" status', () => {
    expect(toDraftBalance({ status: false })).toEqual({ status: false });
  });

  it('returns undefined for empty or non object input', () => {
    expect(toDraftBalance(null)).toBeUndefined();
    expect(toDraftBalance('x')).toBeUndefined();
  });
});

describe('toSimpleAccounts', () => {
  it('reads the list of the data envelope', () => {
    const list = [
      { id: 'a', name: 'Kas', accountNumber: '1-10000', type: 'debit', isContra: false },
    ];
    expect(toSimpleAccounts({ code: 200, data: list })).toEqual(list);
  });

  it('is an empty list for anything else', () => {
    expect(toSimpleAccounts(undefined)).toEqual([]);
    expect(toSimpleAccounts({ data: { message: 'x' } })).toEqual([]);
  });
});

describe('toDateLocked', () => {
  it('reads isLocked of the data envelope', () => {
    expect(toDateLocked({ data: { isLocked: true, period: { id: 'p' } } })).toBe(true);
    expect(toDateLocked({ data: { isLocked: false, period: null } })).toBe(false);
  });

  it('is false for anything else', () => {
    expect(toDateLocked(undefined)).toBe(false);
    expect(toDateLocked({})).toBe(false);
  });
});
