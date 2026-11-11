import { dateFilter, type DateRange } from './saleListState';

export type OverpaymentFilter = 'all' | 'yes' | 'no';

export type SalePaymentRow = {
  id: string;
  transactionNumber: string;
  paymentDate: string | null;
  /** Money received in total. */
  amount: number;
  /** The part above the invoice; 0 when the payment matched or fell short. */
  overpaymentAmount: number;
  lateFeeAmount: number;
  memo: string | null;
  sale: { id: string; transactionNumber: string; customerName: string } | null;
  paymentMethodName: string | null;
  depositAccountName: string | null;
};

export type SalePaymentListParams = {
  page: number;
  limit: number;
  search?: string;
  startDate?: string;
  endDate?: string;
  /** `true` only those with an excess, `false` only those without. */
  hasOverpayment?: boolean;
};

export interface SalePaymentListState {
  search: string;
  range: DateRange;
  overpayment: OverpaymentFilter;
  page: number;
  limit: number;
}

export type SalePaymentListAction =
  | { type: 'search'; value: string }
  | { type: 'range'; value: DateRange }
  | { type: 'overpayment'; value: OverpaymentFilter }
  | { type: 'page'; value: number }
  | { type: 'limit'; value: number }
  | { type: 'reset' };

export const initialPaymentListState: SalePaymentListState = {
  search: '',
  range: [null, null],
  overpayment: 'all',
  page: 1,
  limit: 10,
};

/** Any change to what is listed starts again from the first page. */
export const paymentListReducer = (
  state: SalePaymentListState,
  action: SalePaymentListAction
): SalePaymentListState => {
  switch (action.type) {
    case 'search':
      return { ...state, search: action.value, page: 1 };
    case 'range':
      return { ...state, range: action.value, page: 1 };
    case 'overpayment':
      return { ...state, overpayment: action.value, page: 1 };
    case 'limit':
      return { ...state, limit: action.value, page: 1 };
    case 'page':
      return { ...state, page: action.value };
    case 'reset':
      return { ...initialPaymentListState, limit: state.limit };
    default:
      return state;
  }
};

export const paymentListParams = (state: SalePaymentListState): SalePaymentListParams => ({
  page: state.page,
  limit: state.limit,
  search: state.search.trim() || undefined,
  ...dateFilter(state.range),
  hasOverpayment: state.overpayment === 'all' ? undefined : state.overpayment === 'yes',
});

export const hasActivePaymentFilters = (state: SalePaymentListState): boolean =>
  state.overpayment !== 'all' ||
  Boolean(state.search.trim()) ||
  Boolean(dateFilter(state.range).startDate);
