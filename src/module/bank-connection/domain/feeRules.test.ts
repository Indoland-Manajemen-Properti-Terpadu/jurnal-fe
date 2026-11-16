import { describe, expect, it } from 'vitest';
import { LOCAL_FEE_RULES, usageOf } from '@/module/bank-connection/domain/feeRules';

describe('LOCAL_FEE_RULES', () => {
  it('has a rule only for BCA corporate, as placeholder figures until the price is decided', () => {
    expect(Object.keys(LOCAL_FEE_RULES)).toEqual(['014']);
    expect(LOCAL_FEE_RULES['014']?.CORPORATE).toEqual({
      monthly: 50_000,
      includedRefreshes: 500,
      extraRefreshFee: 100,
      autoRefreshes: 180,
      autoDebit: true,
    });
    expect(LOCAL_FEE_RULES['014']?.INDIVIDUAL).toBeUndefined();
  });
});

describe('usageOf', () => {
  it('says how much of the monthly refreshes are used and what is left', () => {
    expect(usageOf({ used: 120, included: 500 })).toEqual({ left: 380, over: 0, percent: 24 });
  });

  it('says how many refreshes are over the quota, which cost extra', () => {
    expect(usageOf({ used: 530, included: 500 })).toEqual({ left: 0, over: 30, percent: 100 });
  });

  it('never divides by zero', () => {
    expect(usageOf({ used: 3, included: 0 })).toEqual({ left: 0, over: 3, percent: 100 });
  });
});
