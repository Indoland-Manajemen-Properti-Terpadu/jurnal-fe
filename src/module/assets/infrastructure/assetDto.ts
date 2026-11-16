import type {
  AssetCondition,
  AssetPagination,
  AssetStatus,
  DepreciationMethod,
} from '@/module/assets/domain/asset';

export type ApiEnvelope<T> = { code: number; message: string; data: T };
export type PaginatedDto<T> = { data: T[]; pagination: AssetPagination };

/** The API embeds accounts and tags as objects, but an activation response can carry an id. */
export type AccountRefDto = string | { id: string; accountNumber?: string; name?: string } | null;
export type TagRefDto = { id: string; name?: string } | string;

export type AssetVendorDto = {
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
};

export type AssetScheduleRowDto = {
  year: number;
  months: number;
  beginning: number;
  expense: number;
  accumulated: number;
  ending: number;
};

export type AssetDto = {
  id: string;
  code: string;
  name: string;
  categoryCode?: string | null;
  categoryName?: string | null;
  acquisitionDate: string;
  acquisitionCost?: number | null;
  residualValue?: number | null;
  usefulLifeYears?: number | null;
  depreciationMethod?: DepreciationMethod | null;
  accumulatedDepreciation?: number | null;
  openingAccumulatedDepreciation?: number | null;
  depreciationRatePerYear?: number | null;
  depreciationStartDate?: string | null;
  netBookValue?: number | null;
  monthlyEstimate?: number | null;
  status: AssetStatus;
  source?: string | null;
  notes?: string | null;
  brand?: string | null;
  modelType?: string | null;
  serialNumber?: string | null;
  warrantyUntil?: string | null;
  condition?: AssetCondition | null;
  location?: string | null;
  vendor?: AssetVendorDto | null;
  /** Id of the linked Supplier contact (an object when the API populates it). */
  vendorContact?: string | { id: string } | null;
  photos?: string[] | null;
  tags?: TagRefDto[] | null;
  assetAccount?: AccountRefDto;
  creditAccount?: AccountRefDto;
  accumDeprAccount?: AccountRefDto;
  deprExpenseAccount?: AccountRefDto;
  disposalProceedsAccount?: AccountRefDto;
  disposalGainLossAccount?: AccountRefDto;
  disposalDate?: string | null;
  disposalPrice?: number | null;
  disposalGainLoss?: number | null;
  proappsSyncError?: string | null;
  schedule?: AssetScheduleRowDto[] | null;
};

export type AssetSummaryDto = {
  totalAcquisitionCost?: number;
  totalAccumulatedDepreciation?: number;
  totalNetBookValue?: number;
  counts?: Partial<Record<AssetStatus, number>>;
};

export type AssetJournalDto = {
  id: string;
  transactionNumber: number;
  transactionDate: string;
  status: string;
  notes?: string | null;
  sourceType?: string | null;
  transactionDetail?: Array<{
    account?: { accountNumber?: string; name?: string } | null;
    debit?: number;
    credit?: number;
  }>;
};

export type TagDto = { id: string; name: string };

/** Nested chart-of-accounts row from `/v1/accounts`. */
export type AccountTreeDto = {
  id: string;
  name: string;
  accountNumber?: string;
  type?: string;
  isPostable?: boolean;
  isArchived?: boolean;
  deleted?: boolean;
  subAccount?: AccountTreeDto[];
};

/** `GET /v1/accounts/simple`: a flat list; its `type` is the normal balance, not the account type. */
export type SimpleAccountDto = {
  id: string;
  name: string;
  accountNumber?: string;
  isPostable?: boolean;
};

export type DisposalPreviewDto = {
  catchUpDepreciation?: number | null;
  accumulatedDepreciation?: number | null;
  bookValue?: number | null;
  gainLoss?: number | null;
};
