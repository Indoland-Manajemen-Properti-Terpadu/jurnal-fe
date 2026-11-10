export const JOURNAL_STATUSES = ['ACTIVE', 'VOID', 'REVERSAL'] as const;
export const JOURNAL_TYPES = ['DEFAULT', 'OPENING_BALANCE', 'EXPENSE', 'CLOSING'] as const;
export const JOURNAL_SOURCES = ['manual', 'system'] as const;
export const HISTORY_PAGE_SIZES = [10, 25, 50, 100] as const;

export type JournalStatus = (typeof JOURNAL_STATUSES)[number];
export type JournalType = (typeof JOURNAL_TYPES)[number];
export type JournalSource = (typeof JOURNAL_SOURCES)[number];
export type HistorySortField = 'transactionDate' | 'transactionNumber' | 'createdAt';
export type SortOrder = 'asc' | 'desc';

/** Menu id of the general ledger on the server; its rights gate the history and the void. */
export const LEDGER_MENU_ID = 'JP-GL';

export const DEFAULT_HISTORY_LIMIT = 25;

/** One debit or credit line of an entry in the history list. */
export interface JournalHistoryLine {
  id: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  description: string;
  debit: number;
  credit: number;
}

/** One journal entry of `GET /v1/journal`. */
export interface JournalHistoryEntry {
  id: string;
  transactionNumber: string;
  transactionDate: string;
  transactionType: string;
  status: string;
  notes: string;
  /** `null` when the entry was typed by hand; otherwise the module that posted it. */
  sourceType: string | null;
  tags: string[];
  lines: JournalHistoryLine[];
  totalDebit: number;
  totalCredit: number;
  canVoid: boolean;
  voidBlockedReason: string | null;
}

export interface JournalHistoryPage {
  entries: JournalHistoryEntry[];
  page: number;
  limit: number;
  totalPages: number;
  total: number;
}

export interface JournalHistoryFilters {
  page: number;
  limit: number;
  sortBy: HistorySortField;
  order: SortOrder;
  /** `YYYY-MM-DD`, empty when not set. */
  startDate: string;
  endDate: string;
  status: JournalStatus[];
  type: JournalType | '';
  source: JournalSource | '';
  accounts: string[];
  tags: string[];
  search: string;
}

export const emptyHistoryFilters = (): JournalHistoryFilters => ({
  page: 1,
  limit: DEFAULT_HISTORY_LIMIT,
  sortBy: 'transactionDate',
  order: 'desc',
  startDate: '',
  endDate: '',
  status: [],
  type: '',
  source: '',
  accounts: [],
  tags: [],
  search: '',
});

const SORT_FIELDS: HistorySortField[] = ['transactionDate', 'transactionNumber', 'createdAt'];
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const oneOf = <T extends string>(value: string | null, allowed: readonly T[]): T | '' =>
  allowed.includes(value as T) ? (value as T) : '';

const positiveInt = (value: string | null, fallback: number) => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

const dateParam = (value: string | null) => (value && DATE_PATTERN.test(value) ? value : '');

/** Reads the filters from the address; anything unknown or malformed falls back to the default. */
export const filtersFromParams = (params: URLSearchParams): JournalHistoryFilters => {
  const base = emptyHistoryFilters();
  const limit = positiveInt(params.get('limit'), base.limit);
  const [rawField = '', rawOrder = ''] = (params.get('sort') ?? '').split(':');
  const field = SORT_FIELDS.find((item) => item === rawField);
  return {
    page: positiveInt(params.get('page'), base.page),
    limit: HISTORY_PAGE_SIZES.some((size) => size === limit) ? limit : base.limit,
    sortBy: field ?? base.sortBy,
    order: field && rawOrder === 'asc' ? 'asc' : 'desc',
    startDate: dateParam(params.get('from')),
    endDate: dateParam(params.get('to')),
    status: params
      .getAll('status')
      .filter((s): s is JournalStatus => JOURNAL_STATUSES.some((item) => item === s)),
    type: oneOf(params.get('type'), JOURNAL_TYPES),
    source: oneOf(params.get('source'), JOURNAL_SOURCES),
    accounts: params.getAll('account').filter(Boolean),
    tags: params.getAll('tag').filter(Boolean),
    search: params.get('q')?.trim() ?? '',
  };
};

/** The address for the filters; a value that equals the default is left out to keep it short. */
export const filtersToParams = (filters: JournalHistoryFilters): URLSearchParams => {
  const base = emptyHistoryFilters();
  const params = new URLSearchParams();
  if (filters.page > 1) params.set('page', String(filters.page));
  if (filters.limit !== base.limit) params.set('limit', String(filters.limit));
  if (filters.sortBy !== base.sortBy || filters.order !== base.order) {
    params.set('sort', `${filters.sortBy}:${filters.order}`);
  }
  if (filters.startDate) params.set('from', filters.startDate);
  if (filters.endDate) params.set('to', filters.endDate);
  filters.status.forEach((value) => params.append('status', value));
  if (filters.type) params.set('type', filters.type);
  if (filters.source) params.set('source', filters.source);
  filters.accounts.forEach((value) => params.append('account', value));
  filters.tags.forEach((value) => params.append('tag', value));
  if (filters.search) params.set('q', filters.search);
  return params;
};

/** The query of `GET /v1/journal`: repeated keys for status, account and tags. */
export const toHistoryQuery = (filters: JournalHistoryFilters): URLSearchParams => {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sortBy: `${filters.sortBy}:${filters.order}`,
  });
  if (filters.startDate) params.set('startDate', filters.startDate);
  if (filters.endDate) params.set('endDate', filters.endDate);
  filters.status.forEach((value) => params.append('status', value));
  if (filters.type) params.set('transactionType', filters.type);
  if (filters.source) params.set('source', filters.source);
  filters.accounts.forEach((value) => params.append('account', value));
  filters.tags.forEach((value) => params.append('tags', value));
  if (filters.search) params.set('search', filters.search);
  return params;
};

export const EXPORT_TYPES = ['xlsx', 'pdf', 'csv'] as const;
export type JournalExportType = (typeof EXPORT_TYPES)[number];

/** The query of `GET /v1/journal/export/:type`: the list's filters as they are, without paging. */
export const toExportQuery = (filters: JournalHistoryFilters): URLSearchParams => {
  const params = toHistoryQuery(filters);
  params.delete('page');
  params.delete('limit');
  return params;
};

/** Whether any filter narrows the list (paging and sorting do not count). */
export const hasActiveFilters = (filters: JournalHistoryFilters): boolean =>
  Boolean(
    filters.startDate ||
    filters.endDate ||
    filters.status.length ||
    filters.type ||
    filters.source ||
    filters.accounts.length ||
    filters.tags.length ||
    filters.search
  );

/** Short account summary of an entry: the first two accounts and how many more there are. */
export const summarizeAccounts = (
  lines: JournalHistoryLine[]
): { names: string[]; more: number } => {
  const names = [...new Set(lines.map((line) => line.accountName).filter(Boolean))];
  return { names: names.slice(0, 2), more: Math.max(0, names.length - 2) };
};
