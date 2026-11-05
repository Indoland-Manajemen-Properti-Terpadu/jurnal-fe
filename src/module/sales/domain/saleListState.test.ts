import { describe, expect, it } from 'vitest';
import { initialListState, listParams, saleListReducer } from './saleListState';

describe('saleListReducer', () => {
  it('starts on the sent tab, first page, no filters', () => {
    expect(initialListState).toMatchObject({
      tab: 'sent',
      status: 'all',
      page: 1,
      search: '',
      range: [null, null],
    });
  });

  it('resets the status and page when the tab changes', () => {
    const state = { ...initialListState, tab: 'sent' as const, status: 'PAID' as const, page: 4 };
    expect(saleListReducer(state, { type: 'tab', tab: 'draft' })).toMatchObject({
      tab: 'draft',
      status: 'all',
      page: 1,
    });
  });

  it('goes back to page 1 whenever a filter changes', () => {
    const state = { ...initialListState, page: 3 };
    expect(saleListReducer(state, { type: 'search', value: 'AAG' }).page).toBe(1);
    expect(saleListReducer(state, { type: 'status', value: 'OVERDUE' }).page).toBe(1);
    expect(
      saleListReducer(state, { type: 'range', value: ['2026-11-01', '2026-11-30'] }).page
    ).toBe(1);
    expect(saleListReducer(state, { type: 'limit', value: 25 })).toMatchObject({
      page: 1,
      limit: 25,
    });
  });

  it('keeps the page when only the page changes', () => {
    expect(saleListReducer(initialListState, { type: 'page', value: 2 }).page).toBe(2);
  });

  it('clears every filter but keeps the tab and page size', () => {
    const state = {
      ...initialListState,
      tab: 'sent' as const,
      limit: 25,
      status: 'PAID' as const,
      search: 'x',
      range: ['2026-11-01', '2026-11-30'] as [string, string],
    };
    expect(saleListReducer(state, { type: 'reset' })).toMatchObject({
      tab: 'sent',
      limit: 25,
      status: 'all',
      search: '',
      range: [null, null],
    });
  });
});

describe('listParams', () => {
  it('uses the tab query and sends dates only when both are set', () => {
    expect(listParams(initialListState)).toEqual({
      page: 1,
      limit: 10,
      search: undefined,
      paymentStatus: ['UNPAID', 'PAID', 'OVERDUE'],
      startDate: undefined,
      endDate: undefined,
    });
    expect(
      listParams({ ...initialListState, range: ['2026-11-01', null] }).startDate
    ).toBeUndefined();
    expect(
      listParams({
        ...initialListState,
        tab: 'draft',
        range: ['2026-11-01', '2026-11-30'],
        search: ' AAG ',
      })
    ).toMatchObject({
      paymentStatus: 'DRAFT',
      search: 'AAG',
      startDate: '2026-11-01',
      endDate: '2026-11-30',
    });
  });
});
