import { toDraftBalance } from './draftBalanceMapper';

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
