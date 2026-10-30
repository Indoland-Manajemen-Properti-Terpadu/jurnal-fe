import { sumAmounts, subtractAmounts } from './dashboardMoney';
import type { AgingBucket, MonthlyPoint } from './dashboardTypes';

export const getTrendTotals = (points: MonthlyPoint[]) => {
  const invoiced = sumAmounts(points.map((p) => p.invoiced));
  const collected = sumAmounts(points.map((p) => p.collected));
  return { invoiced, collected, uncollected: Math.max(0, subtractAmounts(invoiced, collected)) };
};

export const getAgingTotals = (buckets: AgingBucket[]) => ({
  amount: sumAmounts(buckets.map((b) => b.amount)),
  count: buckets.reduce((acc, b) => acc + b.count, 0),
});

/** Sum of the positive parts: negative balances do not reduce a composition total. */
export const sumPositive = (values: number[]): number =>
  sumAmounts(values.map((v) => Math.max(0, v)));
