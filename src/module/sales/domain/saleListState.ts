import type { SaleDisplayCode, SaleListParams } from './sale';
import { tabParams, type SaleTab } from './saleStatus';

export type DateRange = [string | null, string | null];

export interface SaleListState {
  tab: SaleTab;
  status: SaleDisplayCode | 'all';
  range: DateRange;
  search: string;
  page: number;
  limit: number;
}

export type SaleListAction =
  | { type: 'tab'; tab: SaleTab }
  | { type: 'status'; value: SaleDisplayCode | 'all' }
  | { type: 'range'; value: DateRange }
  | { type: 'search'; value: string }
  | { type: 'page'; value: number }
  | { type: 'limit'; value: number }
  | { type: 'reset' };

export const initialListState: SaleListState = {
  tab: 'sent',
  status: 'all',
  range: [null, null],
  search: '',
  page: 1,
  limit: 10,
};

/** Any change to what is listed starts again from the first page. */
export const saleListReducer = (state: SaleListState, action: SaleListAction): SaleListState => {
  switch (action.type) {
    case 'tab':
      return { ...state, tab: action.tab, status: 'all', page: 1 };
    case 'status':
      return { ...state, status: action.value, page: 1 };
    case 'range':
      return { ...state, range: action.value, page: 1 };
    case 'search':
      return { ...state, search: action.value, page: 1 };
    case 'limit':
      return { ...state, limit: action.value, page: 1 };
    case 'page':
      return { ...state, page: action.value };
    case 'reset':
      return { ...initialListState, tab: state.tab, limit: state.limit };
    default:
      return state;
  }
};

/** The date filter applies only once both ends are chosen. */
export const dateFilter = (range: DateRange): { startDate?: string; endDate?: string } =>
  range[0] && range[1] ? { startDate: range[0], endDate: range[1] } : {};

export const listParams = (state: SaleListState): SaleListParams => {
  const { startDate, endDate } = dateFilter(state.range);
  return {
    page: state.page,
    limit: state.limit,
    search: state.search.trim() || undefined,
    ...tabParams(state.tab, state.status),
    startDate,
    endDate,
  };
};

export const hasActiveFilters = (state: SaleListState): boolean =>
  state.status !== 'all' ||
  Boolean(state.search.trim()) ||
  Boolean(dateFilter(state.range).startDate);
