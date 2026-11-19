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
      customer: undefined,
      paymentMethod: undefined,
      sortBy: 'paymentDate',
      sortOrder: 'desc',
    });
  });

  it('trims the search and waits for both dates', () => {
    const state = {
      ...initialPaymentListState,
      search: '  inv ',
      range: ['2026-11-01', null] as [string | null, string | null],
    };
    expect(paymentListParams(state)).toMatchObject({ search: 'inv' });
    expect(paymentListParams(state).startDate).toBeUndefined();
    expect(paymentListParams({ ...state, range: ['2026-11-01', '2026-11-30'] }).endDate).toBe(
      '2026-11-30'
    );
  });
});

describe('paymentListReducer', () => {
  it('returns to page 1 on any filter change but not on a page change', () => {
    const onPage3 = { ...initialPaymentListState, page: 3 };
    expect(paymentListReducer(onPage3, { type: 'customer', value: 'c1' }).page).toBe(1);
    expect(paymentListReducer(onPage3, { type: 'search', value: 'x' }).page).toBe(1);
    expect(paymentListReducer(onPage3, { type: 'page', value: 4 }).page).toBe(4);
  });

  it('resets filters but keeps the page size', () => {
    const state = { ...initialPaymentListState, limit: 50, customer: 'c1' };
    const next = paymentListReducer(state, { type: 'reset' });
    expect(next.limit).toBe(50);
    expect(hasActivePaymentFilters(next)).toBe(false);
    expect(hasActivePaymentFilters(state)).toBe(true);
  });
});

describe('sorting and the extra filters', () => {
  it('flips the direction on the sorted column and starts a new column largest or newest first', () => {
    const flipped = paymentListReducer(initialPaymentListState, {
      type: 'sort',
      by: 'paymentDate',
    });
    expect(flipped.sortOrder).toBe('asc');
    const amount = paymentListReducer(flipped, { type: 'sort', by: 'amount' });
    expect([amount.sortBy, amount.sortOrder]).toEqual(['amount', 'desc']);
    const number = paymentListReducer(amount, { type: 'sort', by: 'transactionNumber' });
    expect([number.sortBy, number.sortOrder]).toEqual(['transactionNumber', 'asc']);
  });

  it('sends the customer and method and counts them as active filters', () => {
    let state = paymentListReducer(initialPaymentListState, { type: 'customer', value: 'c1' });
    state = paymentListReducer(state, { type: 'paymentMethod', value: 'm1' });
    expect(paymentListParams(state)).toMatchObject({ customer: 'c1', paymentMethod: 'm1' });
    expect(hasActivePaymentFilters(state)).toBe(true);
    expect(hasActivePaymentFilters(paymentListReducer(state, { type: 'reset' }))).toBe(false);
  });

  it('keeps the chosen sort when the filters are reset', () => {
    const sorted = paymentListReducer(initialPaymentListState, { type: 'sort', by: 'amount' });
    const reset = paymentListReducer(sorted, { type: 'reset' });
    expect([reset.sortBy, reset.sortOrder]).toEqual(['amount', 'desc']);
  });
});
