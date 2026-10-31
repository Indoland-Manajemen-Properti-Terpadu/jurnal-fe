import { fromMinor, sumMinor, toMinor } from '@/lib/money/money';
import {
  AssetItem,
  AssetStatus,
  DepreciationMethod,
  DepreciationScheduleItem,
} from '@/module/assets/domain/asset';

/**
 * Pure depreciation rules for fixed assets.
 *
 * Rounding policy: depreciation amounts (monthly, yearly, accumulated, net book value) are
 * rounded to whole rupiah with `Math.round`, exactly as the page always showed them. Sums and
 * the disposal gain or loss are computed in integer minor units; a value with sub-cent
 * precision is first rounded half up to the cent (`toCents`).
 */

export interface DepreciationResult {
  accumulatedDepreciation: number;
  netBookValue: number;
}

export interface AssetTotals {
  totalAcquisitionCost: number;
  totalAccumulatedDepreciation: number;
  totalNetBookValue: number;
  activeCount: number;
}

export interface DepreciationEstimate {
  annual: number;
  monthly: number;
}

/** `Number(x) || 0` as the views always did: NaN, null and undefined count as zero. */
export const toSafeNumber = (value: unknown): number => Number(value) || 0;

/** Rounds half up to the cent, then converts to integer minor units. */
export const toCents = (value: number): number =>
  toMinor(Math.round(toSafeNumber(value) * 100) / 100);

export const isNonDepreciable = (
  asset: Pick<AssetItem, 'depreciationMethod' | 'usefulLifeYears'>
): boolean => asset.depreciationMethod === 'none' || asset.usefulLifeYears <= 0;

export const isFullyDepreciated = (
  method: DepreciationMethod,
  netBookValue: number,
  residualValue: number
): boolean => method !== 'none' && netBookValue <= residualValue;

/** Status after a recalculation: a disposed asset stays disposed. */
export const resolveAssetStatus = (
  current: AssetStatus | undefined,
  method: DepreciationMethod,
  netBookValue: number,
  residualValue: number
): AssetStatus => {
  if (isFullyDepreciated(method, netBookValue, residualValue)) return 'fully_depreciated';
  return current === 'disposed' ? 'disposed' : 'active';
};

/**
 * Expense of one year of double-declining-balance depreciation: the rate is twice the straight-line
 * rate, never takes the book value below the residual value, and the last year closes to it.
 */
const decliningYearExpense = (
  beginning: number,
  residual: number,
  usefulLifeYears: number,
  year: number
): number => {
  const expense = Math.round(beginning * (2 / usefulLifeYears));
  return beginning - expense < residual || year >= usefulLifeYears
    ? Math.max(0, beginning - residual)
    : expense;
};

export const calculateAssetDepreciation = (
  cost: number,
  residual: number,
  usefulLifeYears: number,
  method: DepreciationMethod,
  acquisitionDateStr: string,
  now: Date = new Date()
): DepreciationResult => {
  if (method === 'none' || usefulLifeYears <= 0) {
    return { accumulatedDepreciation: 0, netBookValue: cost };
  }

  const acquisitionDate = new Date(acquisitionDateStr);

  let monthsElapsed =
    (now.getFullYear() - acquisitionDate.getFullYear()) * 12 +
    (now.getMonth() - acquisitionDate.getMonth());
  if (monthsElapsed < 0) monthsElapsed = 0;

  const totalMonths = usefulLifeYears * 12;
  const depreciableAmount = Math.max(0, cost - residual);

  if (method === 'straight_line') {
    const monthlyDep = depreciableAmount / totalMonths;
    const cappedMonths = Math.min(monthsElapsed, totalMonths);
    const accumulated = Math.round(monthlyDep * cappedMonths);
    return {
      accumulatedDepreciation: accumulated,
      netBookValue: Math.max(residual, cost - accumulated),
    };
  }

  if (method === 'double_declining') {
    // Same year-by-year rule as the schedule, so the list and the schedule always agree: the
    // balance falls by the declining rate each year and the last year closes to the residual value.
    if (monthsElapsed >= totalMonths) {
      return { accumulatedDepreciation: Math.round(cost - residual), netBookValue: residual };
    }
    const fullYears = Math.floor(monthsElapsed / 12);
    const partialYearFraction = (monthsElapsed % 12) / 12;
    let currentBookValue = cost;
    for (let year = 1; year <= fullYears; year += 1) {
      currentBookValue -= decliningYearExpense(currentBookValue, residual, usefulLifeYears, year);
    }
    if (partialYearFraction > 0) {
      currentBookValue -=
        decliningYearExpense(currentBookValue, residual, usefulLifeYears, fullYears + 1) *
        partialYearFraction;
    }
    return {
      accumulatedDepreciation: Math.round(cost - currentBookValue),
      netBookValue: Math.round(currentBookValue),
    };
  }

  return { accumulatedDepreciation: 0, netBookValue: cost };
};

/**
 * Yearly schedule. The loop runs over whole years only, so a fractional useful life such as
 * 2.5 produces 2 rows and never reaches the residual value; kept as is (see README known gaps).
 */
export const generateDepreciationSchedule = (asset: AssetItem): DepreciationScheduleItem[] => {
  const schedule: DepreciationScheduleItem[] = [];
  const { acquisitionCost, residualValue, usefulLifeYears, depreciationMethod, acquisitionDate } =
    asset;

  if (depreciationMethod === 'none' || usefulLifeYears <= 0) {
    return [
      {
        yearNumber: 1,
        yearDate: acquisitionDate ? acquisitionDate.substring(0, 4) : 'Tahun 1',
        beginningBookValue: acquisitionCost,
        depreciationExpense: 0,
        accumulatedDepreciation: 0,
        endingBookValue: acquisitionCost,
      },
    ];
  }

  const startYear = acquisitionDate
    ? parseInt(acquisitionDate.substring(0, 4), 10)
    : new Date().getFullYear();
  let currentBeginning = acquisitionCost;
  let runningAccum = 0;
  const depreciableAmount = Math.max(0, acquisitionCost - residualValue);
  const annualDep =
    depreciationMethod === 'straight_line' ? Math.round(depreciableAmount / usefulLifeYears) : 0;

  for (let i = 1; i <= usefulLifeYears; i += 1) {
    const isLastYear = i === usefulLifeYears;
    let expense: number;
    if (depreciationMethod === 'straight_line') {
      expense = isLastYear
        ? Math.max(0, currentBeginning - residualValue)
        : Math.min(annualDep, currentBeginning - residualValue);
    } else {
      expense = decliningYearExpense(currentBeginning, residualValue, usefulLifeYears, i);
    }
    runningAccum += expense;
    const ending = Math.max(residualValue, currentBeginning - expense);

    schedule.push({
      yearNumber: i,
      yearDate: `${startYear + i - 1}`,
      beginningBookValue: currentBeginning,
      depreciationExpense: expense,
      accumulatedDepreciation: runningAccum,
      endingBookValue: ending,
    });

    currentBeginning = ending;
  }

  return schedule;
};

/** Yearly and monthly expense shown as a live preview in the asset form. */
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

/** Gain (positive) or loss (negative) of selling an asset at `disposalPrice`. */
export const calculateDisposalGainLoss = (disposalPrice: number, netBookValue: number): number =>
  Number(fromMinor(toCents(disposalPrice) - toCents(netBookValue)));

/** Share of the cost already depreciated, whole percent, capped at 100. */
export const depreciationPercent = (cost: number, accumulated: number): number =>
  cost > 0 ? Math.min(100, Math.round((accumulated / cost) * 100)) : 0;

/** Share of the cost left at the end of a schedule year, whole percent. */
export const remainingPercentOfCost = (cost: number, endingBookValue: number): number =>
  cost > 0 ? Math.round((endingBookValue / cost) * 100) : 0;

const sumAmounts = (values: unknown[]): number =>
  Number(fromMinor(sumMinor(values.map((value) => toCents(toSafeNumber(value))))));

export const summarizeAssets = (assets: AssetItem[]): AssetTotals => {
  const active = assets.filter((item) => item.status !== 'disposed');
  return {
    totalAcquisitionCost: sumAmounts(active.map((item) => item.acquisitionCost)),
    totalAccumulatedDepreciation: sumAmounts(active.map((item) => item.accumulatedDepreciation)),
    totalNetBookValue: sumAmounts(active.map((item) => item.netBookValue)),
    activeCount: assets.filter((item) => item.status === 'active').length,
  };
};
