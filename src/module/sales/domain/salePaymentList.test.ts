import { describe, expect, it } from 'vitest';
import {
  hasActivePaymentFilters,
  initialPaymentListState,
  paymentListParams,
  paymentListReducer,
} from './salePaymentList';

describe('paymentListParams', () => {
  it('sends only what is set', () => {
    expect(paymentListParams(initialPaymentListState)).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      hasOverpayment: undefined,
    });
  });

  it('maps the overpayment filter to a boolean and waits for both dates', () => {
    const state = {
      ...initialPaymentListState,
      search: '  inv ',
      overpayment: 'yes' as const,
      range: ['2026-11-01', null] as [string | null, string | null],
    };
    expect(paymentListParams(state)).toMatchObject({ search: 'inv', hasOverpayment: true });
    expect(paymentListParams(state).startDate).toBeUndefined();
    expect(paymentListParams({ ...state, overpayment: 'no' }).hasOverpayment).toBe(false);
    expect(paymentListParams({ ...state, range: ['2026-11-01', '2026-11-30'] }).endDate).toBe(
      '2026-11-30'
    );
  });
});

describe('paymentListReducer', () => {
  it('returns to page 1 on any filter change but not on a page change', () => {
    const onPage3 = { ...initialPaymentListState, page: 3 };
    expect(paymentListReducer(onPage3, { type: 'overpayment', value: 'no' }).page).toBe(1);
    expect(paymentListReducer(onPage3, { type: 'search', value: 'x' }).page).toBe(1);
    expect(paymentListReducer(onPage3, { type: 'page', value: 4 }).page).toBe(4);
  });

  it('resets filters but keeps the page size', () => {
    const state = { ...initialPaymentListState, limit: 50, overpayment: 'yes' as const };
    const next = paymentListReducer(state, { type: 'reset' });
    expect(next.limit).toBe(50);
    expect(hasActivePaymentFilters(next)).toBe(false);
    expect(hasActivePaymentFilters(state)).toBe(true);
  });
});
