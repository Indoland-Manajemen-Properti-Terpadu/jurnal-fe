import type { DepreciationDue, WriteOffType } from '@/module/assets/domain/writeOff';

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

/** Condition of the asset when it was acquired. */
export const ASSET_CONDITIONS = ['new', 'second', 'refurbished'] as const;
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

/** Most photo links one asset can hold. */
export const MAX_ASSET_PHOTOS = 5;

/** Vendor details as the API copies them from the linked contact. */
export interface AssetVendor {
  name: string;
  phone?: string;
  email?: string;
  address?: string;
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
  brand?: string;
  modelType?: string;
  serialNumber?: string;
  /** `YYYY-MM-DD` */
  warrantyUntil?: string;
  condition: AssetCondition | null;
  location?: string;
  vendor: AssetVendor | null;
  /** Id of the Supplier contact the vendor comes from. */
  vendorContactId: string | null;
  photos: string[];
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
  /** Why the asset left the books; null for disposals made before write-off reports existed. */
  disposalType: WriteOffType | null;
  /** Id of the write-off report that disposed the asset. */
  disposalReportId: string | null;
  /** Depreciation the books are still missing, up to the last closed month. */
  depreciationDue: DepreciationDue;
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
  accountNumber: string;
  accountName: string;
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
  brand: string;
  modelType: string;
  serialNumber: string;
  /** `YYYY-MM-DD`, empty when there is no warranty. */
  warrantyUntil: string;
  condition: AssetCondition | '';
  location: string;
  /** Id of a Supplier contact; empty means no vendor. */
  vendorContactId: string;
  /** Photos already saved on the asset, as links or paths. */
  photos: string[];
  /** Photos picked from the device, sent with the save. */
  photoFiles?: File[];
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

/** What disposing the asset on a date for a price would book, as the API calculates it. */
export interface DisposalPreview {
  /** Depreciation not yet posted that the disposal books first. */
  catchUpDepreciation: number;
  accumulatedDepreciation: number;
  bookValue: number;
  /** Positive is a gain, negative a loss. */
  gainLoss: number;
}

/** Account groups the API can filter the account list by. */
export type AssetAccountKind = 'fixed_asset' | 'accumulated_depreciation' | 'depreciation_expense';

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
  /** Assets in the books (active and fully depreciated). */
  ownedCount: number;
  /** Assets waiting to be activated, which the totals leave out. */
  pending: { count: number; totalAcquisitionCost: number };
}
