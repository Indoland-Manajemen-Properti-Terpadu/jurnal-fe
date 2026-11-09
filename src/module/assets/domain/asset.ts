export type DepreciationMethod = 'straight_line' | 'double_declining' | 'none';

/** `pending` is an asset that has no accounts or depreciation yet and is not in the books. */
export type AssetStatus = 'pending' | 'active' | 'fully_depreciated' | 'disposed';

export interface AccountRef {
  id: string;
  accountNumber: string;
  name: string;
}

export interface AssetTag {
  id: string;
  name: string;
}

/** One calendar year of the depreciation schedule; the first and last year can be partial. */
export interface AssetScheduleRow {
  year: number;
  months: number;
  beginning: number;
  expense: number;
  accumulated: number;
  ending: number;
}

export interface AssetItem {
  id: string;
  code: string;
  name: string;
  categoryCode: string | null;
  categoryName: string | null;
  acquisitionDate: string; // YYYY-MM-DD
  acquisitionCost: number;
  residualValue: number;
  usefulLifeYears: number;
  depreciationMethod: DepreciationMethod;
  /** Depreciation booked so far plus the amount collected before the asset was recorded. */
  accumulatedDepreciation: number;
  /** Depreciation collected before the asset was recorded in Jurnal. */
  openingAccumulatedDepreciation: number;
  depreciationRatePerYear: number;
  depreciationStartDate?: string;
  netBookValue: number;
  monthlyEstimate: number;
  status: AssetStatus;
  /** Where the asset was created: `proapps` (pushed from ProApps) or `jurnal`. */
  source: string;
  notes?: string;
  tags: AssetTag[];
  assetAccount: AccountRef | null;
  creditAccount: AccountRef | null;
  accumDeprAccount: AccountRef | null;
  deprExpenseAccount: AccountRef | null;
  disposalProceedsAccount: AccountRef | null;
  disposalGainLossAccount: AccountRef | null;
  disposalDate?: string;
  disposalPrice?: number;
  disposalGainLoss?: number;
  /** Set when the last hand-over to ProApps did not go through. */
  syncError?: string;
  schedule: AssetScheduleRow[];
}

/** Account that can be picked on an asset form. */
export interface AccountOption {
  id: string;
  accountNumber: string;
  name: string;
  /** Account type as the chart of accounts names it, e.g. "Aktiva Tetap". */
  type: string;
}

/** Posted entry of an asset journal. */
export interface AssetJournalLine {
  account: string;
  debit: number;
  credit: number;
}

export interface AssetJournal {
  id: string;
  transactionNumber: number;
  date: string;
  status: string;
  notes: string;
  sourceType: string;
  lines: AssetJournalLine[];
}

/** Fields of the add and edit forms. */
export interface AssetFormValues {
  code: string;
  name: string;
  categoryName: string;
  acquisitionDate: string;
  acquisitionCost: number;
  notes: string;
  tagIds: string[];
}

/** Accounts and depreciation terms that put an asset in the books. */
export interface ActivationValues {
  assetAccount: string;
  creditAccount: string;
  accumDeprAccount: string;
  deprExpenseAccount: string;
  depreciationMethod: DepreciationMethod;
  usefulLifeYears: number;
  residualValue: number;
  accumulatedDepreciation: number;
  /** `YYYY-MM-DD`; empty means depreciation starts at the acquisition date. */
  depreciationStartDate: string;
}

export interface DisposalValues {
  disposalDate: string;
  disposalPrice: number;
  proceedsAccount: string;
  gainLossAccount: string;
}

export const ASSET_SORT_KEYS = [
  'name',
  'code',
  'acquisitionDate',
  'acquisitionCost',
  'netBookValue',
  'createdAt',
] as const;
export type AssetSortKey = (typeof ASSET_SORT_KEYS)[number];
export type AssetSortOrder = 'asc' | 'desc';

export interface AssetListParams {
  page: number;
  limit: number;
  status?: AssetStatus;
  search?: string;
  sortBy?: AssetSortKey;
  sortOrder?: AssetSortOrder;
}

export interface AssetPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Paginated<T> {
  items: T[];
  pagination: AssetPagination;
}

export interface AssetSummary {
  totalAcquisitionCost: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
  counts: Record<AssetStatus, number>;
}
