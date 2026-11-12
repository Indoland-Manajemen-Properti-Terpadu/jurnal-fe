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
  /** Where the money went: one entry per invoice line (the line's id), plus the late fee above. */
  items: Array<{ saleItem: string | null; amount: number }>;
  paymentMethodName: string | null;
  depositAccountName: string | null;
};

/** Columns the server can sort payments by. */
export type PaymentSortBy = 'paymentDate' | 'transactionNumber' | 'amount' | 'overpaymentAmount';
export type SortOrder = 'asc' | 'desc';

export type SalePaymentListParams = {
  page: number;
  limit: number;
  search?: string;
  /** Only the payments of one invoice (id, external id or invoice number). */
  sale?: string;
  customer?: string;
  paymentMethod?: string;
  depositAccount?: string;
  sortBy?: PaymentSortBy;
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
  /** `true` only those with an excess, `false` only those without. */
  hasOverpayment?: boolean;
};

export interface SalePaymentListState {
  search: string;
  range: DateRange;
  overpayment: OverpaymentFilter;
  customer: string | null;
  paymentMethod: string | null;
  depositAccount: string | null;
  sortBy: PaymentSortBy;
  sortOrder: SortOrder;
  page: number;
  limit: number;
}

export type SalePaymentListAction =
  | { type: 'search'; value: string }
  | { type: 'range'; value: DateRange }
  | { type: 'overpayment'; value: OverpaymentFilter }
  | { type: 'customer'; value: string | null }
  | { type: 'paymentMethod'; value: string | null }
  | { type: 'depositAccount'; value: string | null }
  | { type: 'sort'; by: PaymentSortBy }
  | { type: 'page'; value: number }
  | { type: 'limit'; value: number }
  | { type: 'reset' };

export const initialPaymentListState: SalePaymentListState = {
  search: '',
  range: [null, null],
  overpayment: 'all',
  customer: null,
  paymentMethod: null,
  depositAccount: null,
  sortBy: 'paymentDate',
  sortOrder: 'desc',
  page: 1,
  limit: 10,
};

/** Clicking the sorted column flips the direction; a new column starts newest or largest first. */
const nextSort = (
  state: SalePaymentListState,
  by: PaymentSortBy
): Pick<SalePaymentListState, 'sortBy' | 'sortOrder'> => {
  if (state.sortBy === by) {
    return { sortBy: by, sortOrder: state.sortOrder === 'desc' ? 'asc' : 'desc' };
  }
  return { sortBy: by, sortOrder: by === 'transactionNumber' ? 'asc' : 'desc' };
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
    case 'customer':
      return { ...state, customer: action.value, page: 1 };
    case 'paymentMethod':
      return { ...state, paymentMethod: action.value, page: 1 };
    case 'depositAccount':
      return { ...state, depositAccount: action.value, page: 1 };
    case 'sort':
      return { ...state, ...nextSort(state, action.by), page: 1 };
    case 'limit':
      return { ...state, limit: action.value, page: 1 };
    case 'page':
      return { ...state, page: action.value };
    case 'reset':
      return {
        ...initialPaymentListState,
        limit: state.limit,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
      };
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
  customer: state.customer || undefined,
  paymentMethod: state.paymentMethod || undefined,
  depositAccount: state.depositAccount || undefined,
  sortBy: state.sortBy,
  sortOrder: state.sortOrder,
});

export const hasActivePaymentFilters = (state: SalePaymentListState): boolean =>
  state.overpayment !== 'all' ||
  Boolean(state.customer || state.paymentMethod || state.depositAccount) ||
  Boolean(state.search.trim()) ||
  Boolean(dateFilter(state.range).startDate);
