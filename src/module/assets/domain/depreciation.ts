import type { AssetItem, DepreciationMethod } from '@/module/assets/domain/asset';

/**
 * Figures the register shows next to what the API returns. Depreciation itself (accumulated
 * amount, net book value, schedule, status) is calculated and posted by the API; the estimate
 * here only previews the monthly expense while a form is open.
 */

export interface DepreciationEstimate {
  annual: number;
  monthly: number;
}

/** `Number(x) || 0`: NaN, null and undefined count as zero. */
export const toSafeNumber = (value: unknown): number => Number(value) || 0;

export const isNonDepreciable = (
  asset: Pick<AssetItem, 'depreciationMethod' | 'usefulLifeYears'>
): boolean => asset.depreciationMethod === 'none' || asset.usefulLifeYears <= 0;

/** Yearly and monthly expense shown as a live preview in the activation form. */
export const estimateDepreciation = (
  cost: number,
  residual: number,
  usefulLifeYears: number,
  method: DepreciationMethod
): DepreciationEstimate => {
  const depreciableAmount = Math.max(0, cost - residual);
  let annual = 0;
  if (method !== 'none' && usefulLifeYears > 0) {
    annual =
      method === 'straight_line'
        ? Math.round(depreciableAmount / usefulLifeYears)
        : Math.round(cost * (2 / usefulLifeYears));
  }
  return { annual, monthly: Math.round(annual / 12) };
};

/** `part` as a whole percent of `whole`, capped at 100; zero when there is no whole. */
export const percentOf = (part: number, whole: number): number =>
  whole > 0 ? Math.min(100, Math.max(0, Math.round((part / whole) * 100))) : 0;

/** Share of the cost already depreciated, whole percent, capped at 100. */
export const depreciationPercent = (cost: number, accumulated: number): number =>
  percentOf(accumulated, cost);

const toMonthIndex = (isoDate: string): number => {
  const [year, month] = isoDate.split('-').map(Number);
  return year * 12 + (month - 1);
};

const fromMonthIndex = (index: number): string => {
  const year = Math.floor(index / 12);
  const month = (index % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}-01`;
};

type LifeFields = Pick<
  AssetItem,
  'depreciationMethod' | 'usefulLifeYears' | 'depreciationStartDate' | 'acquisitionDate'
>;

/** First day of the month the useful life ends, or `undefined` without a useful life. */
export const depreciationEndMonth = (asset: LifeFields): string | undefined => {
  if (isNonDepreciable(asset)) return undefined;
  const start = asset.depreciationStartDate || asset.acquisitionDate;
  if (!start) return undefined;
  return fromMonthIndex(toMonthIndex(start) + Math.round(asset.usefulLifeYears * 12));
};

/** Whole months of useful life left after `today` (`YYYY-MM-DD`); never below zero. */
export const remainingLifeMonths = (asset: LifeFields, today: string): number => {
  const end = depreciationEndMonth(asset);
  if (!end) return 0;
  return Math.max(0, toMonthIndex(end) - toMonthIndex(today));
};
