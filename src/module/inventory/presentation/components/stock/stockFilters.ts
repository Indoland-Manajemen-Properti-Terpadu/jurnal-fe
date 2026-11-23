import type { TransferStatusDto } from '@/module/inventory/infrastructure/transferApi';

export type StockTab = 'balances' | 'history' | 'transfers';

export interface StockFilterValues {
  tab: StockTab;
  warehouse: string;
  /** Empty means today. */
  asOf: string;
  search: string;
  from: string;
  to: string;
  product: string;
  /** One or several movement types, separated by commas. */
  type: string;
  /** Product category, for the balances and the history. */
  category: string;
  /** Part of a document number, for the history. */
  doc: string;
  page: number;
  transferStatus: '' | TransferStatusDto;
  transferPage: number;
}

const KEYS: Record<keyof StockFilterValues, string> = {
  tab: 'tab',
  warehouse: 'warehouse',
  asOf: 'asof',
  search: 'q',
  from: 'from',
  to: 'to',
  product: 'product',
  type: 'type',
  category: 'category',
  doc: 'doc',
  page: 'page',
  transferStatus: 'tstatus',
  transferPage: 'tpage',
};

/** The statuses the transfer list can be narrowed to. */
export const TRANSFER_STATUSES: TransferStatusDto[] = [
  'PENDING_APPROVAL',
  'POSTED',
  'REJECTED',
  'VOID',
];

const TABS: StockTab[] = ['balances', 'history', 'transfers'];

/** The filters whose change sends the history back to its first page. */
const HISTORY_FILTERS: (keyof StockFilterValues)[] = [
  'warehouse',
  'from',
  'to',
  'product',
  'type',
  'category',
  'doc',
];

const monthStart = (today: string) => `${today.slice(0, 8)}01`;

const asPage = (value: string | null): number => {
  const page = Number(value);
  return Number.isInteger(page) && page >= 1 ? page : 1;
};

/** The filters a link or the person set; the history opens on this month unless told otherwise. */
export const readFilters = (params: URLSearchParams, today: string): StockFilterValues => {
  const tab = params.get(KEYS.tab);
  const status = params.get(KEYS.transferStatus);
  return {
    tab: TABS.includes(tab as StockTab) ? (tab as StockTab) : 'balances',
    warehouse: params.get(KEYS.warehouse) ?? '',
    asOf: params.get(KEYS.asOf) ?? '',
    search: params.get(KEYS.search) ?? '',
    from: params.get(KEYS.from) ?? monthStart(today),
    to: params.get(KEYS.to) ?? today,
    product: params.get(KEYS.product) ?? '',
    type: params.get(KEYS.type) ?? '',
    category: params.get(KEYS.category) ?? '',
    doc: params.get(KEYS.doc) ?? '',
    page: asPage(params.get(KEYS.page)),
    transferStatus: TRANSFER_STATUSES.includes(status as TransferStatusDto)
      ? (status as TransferStatusDto)
      : '',
    transferPage: asPage(params.get(KEYS.transferPage)),
  };
};

const isEmpty = (key: keyof StockFilterValues, value: unknown) =>
  value === '' ||
  value === undefined ||
  value === null ||
  (key === 'tab' && value === 'balances') ||
  ((key === 'page' || key === 'transferPage') && value === 1);

/**
 * A new address with the patch applied: an emptied filter leaves the address, a changed filter
 * returns to the first page, and the tab keeps the other filters.
 */
export const applyFilterPatch = (
  params: URLSearchParams,
  patch: Partial<StockFilterValues>
): URLSearchParams => {
  const next = new URLSearchParams(params);
  (Object.keys(patch) as (keyof StockFilterValues)[]).forEach((key) => {
    const value = patch[key];
    if (isEmpty(key, value)) next.delete(KEYS[key]);
    else next.set(KEYS[key], String(value));
  });
  if (HISTORY_FILTERS.some((key) => key in patch)) next.delete(KEYS.page);
  if ('transferStatus' in patch) next.delete(KEYS.transferPage);
  return next;
};
