import { fromMinor, toMinor } from '@/lib/money/money';
import {
  MAX_ASSET_PHOTOS,
  type ActivationValues,
  type AssetItem,
  type AssetJournalLine,
} from '@/module/assets/domain/asset';

const toNumber = (minor: number): number => Number(fromMinor(minor));

/**
 * Which parts of an asset a user may change. Assets pushed from ProApps keep their master data
 * there; assets created in Jurnal can change name, category and notes at any time and the code,
 * date and cost only while pending. Tags can always be changed. Disposed assets are closed.
 */
export interface AssetEditRights {
  /** Name, category and notes. */
  details: boolean;
  /** Code, acquisition date and acquisition cost. */
  terms: boolean;
  tags: boolean;
}

export const getAssetEditRights = (
  asset: Pick<AssetItem, 'source' | 'status'>
): AssetEditRights => {
  if (asset.status === 'disposed') return { details: false, terms: false, tags: false };
  if (asset.source === 'proapps') return { details: false, terms: false, tags: true };
  return { details: true, terms: asset.status === 'pending', tags: true };
};

export const canEditAsset = (asset: Pick<AssetItem, 'source' | 'status'>): boolean => {
  const rights = getAssetEditRights(asset);
  return rights.details || rights.terms || rights.tags;
};

export const canActivateAsset = (asset: Pick<AssetItem, 'status'>): boolean =>
  asset.status === 'pending';

/** Active and fully depreciated assets can leave the books through a write-off report. */
export const canDisposeAsset = (asset: Pick<AssetItem, 'status'>): boolean =>
  asset.status === 'active' || asset.status === 'fully_depreciated';

/** Active and fully depreciated assets can have their accounts and depreciation revised. */
export const canReviseAsset = (asset: Pick<AssetItem, 'status'>): boolean =>
  asset.status === 'active' || asset.status === 'fully_depreciated';

export type ActivationErrorKey =
  | 'errAccountRequired'
  | 'errAccountsDistinct'
  | 'errUsefulLifeMin'
  | 'errResidualTooHigh'
  | 'errOpeningTooHigh';

export type ActivationErrors = Partial<Record<keyof ActivationValues, ActivationErrorKey>>;

const ACCOUNT_FIELDS = [
  'assetAccount',
  'creditAccount',
  'accumDeprAccount',
  'deprExpenseAccount',
] as const;

/** An asset that is not depreciated needs no accumulation or expense account. */
const requiredAccounts = (method: ActivationValues['depreciationMethod']) =>
  method === 'none' ? (['assetAccount', 'creditAccount'] as const) : ACCOUNT_FIELDS;

export const validateActivation = (
  values: ActivationValues,
  acquisitionCost: number
): ActivationErrors => {
  const errors: ActivationErrors = {};
  const depreciated = values.depreciationMethod !== 'none';

  for (const field of requiredAccounts(values.depreciationMethod)) {
    if (!values[field]) errors[field] = 'errAccountRequired';
  }

  const picked = ACCOUNT_FIELDS.filter((field) => values[field]);
  const ids = picked.map((field) => values[field]);
  ids.forEach((id, index) => {
    if (ids.indexOf(id) !== index) errors[picked[index]] ??= 'errAccountsDistinct';
  });

  if (depreciated) {
    if (!(values.usefulLifeYears > 0)) errors.usefulLifeYears = 'errUsefulLifeMin';
    if (values.residualValue >= acquisitionCost) errors.residualValue = 'errResidualTooHigh';
    if (values.accumulatedDepreciation > acquisitionCost - values.residualValue) {
      errors.accumulatedDepreciation = 'errOpeningTooHigh';
    }
  }
  return errors;
};

/**
 * Entries the acquisition journal will post on activation: debit the asset, credit the
 * accumulated depreciation collected before recording, and credit the counter account for
 * the book value.
 */
export const previewAcquisitionJournal = (
  values: Pick<ActivationValues, 'accumulatedDepreciation'>,
  acquisitionCost: number
): { asset: number; accumulated: number; counter: number } => {
  const cost = toMinor(acquisitionCost);
  const accumulated = Math.min(toMinor(Math.max(values.accumulatedDepreciation, 0)), cost);
  return {
    asset: toNumber(cost),
    accumulated: toNumber(accumulated),
    counter: toNumber(cost - accumulated),
  };
};

export type PhotoErrorKey = 'errPhotoUrl' | 'errPhotoLimit';

/** The API takes http(s) links or a path on the same site, without spaces. */
const PHOTO_PATTERN = /^(https?:\/\/|\/(?!\/))\S+$/;

export const isValidPhotoUrl = (value: string): boolean => PHOTO_PATTERN.test(value);

export const validatePhotos = (photos: string[]): PhotoErrorKey | null => {
  if (photos.length > MAX_ASSET_PHOTOS) return 'errPhotoLimit';
  return photos.every(isValidPhotoUrl) ? null : 'errPhotoUrl';
};

export const sumJournalLines = (lines: AssetJournalLine[]) => ({
  debit: toNumber(lines.reduce((sum, line) => sum + toMinor(line.debit), 0)),
  credit: toNumber(lines.reduce((sum, line) => sum + toMinor(line.credit), 0)),
});

/** Whether the warranty still covers the asset on `today`, and roughly how long it has left. */
export type WarrantyStatus =
  | { state: 'active'; monthsLeft: number }
  | { state: 'endingSoon' }
  | { state: 'expired' };

const monthIndex = (isoDate: string): number => {
  const [year, month] = isoDate.split('-').map(Number);
  return year * 12 + (month - 1);
};

/**
 * `null` without a warranty date. A warranty that ends this month or next counts as ending soon,
 * so it gets attention before it lapses. Dates are `YYYY-MM-DD`.
 */
export const getWarrantyStatus = (
  warrantyUntil: string | undefined,
  today: string
): WarrantyStatus | null => {
  if (!warrantyUntil) return null;
  if (warrantyUntil < today) return { state: 'expired' };
  const monthsLeft = monthIndex(warrantyUntil) - monthIndex(today);
  return monthsLeft <= 1 ? { state: 'endingSoon' } : { state: 'active', monthsLeft };
};
