export interface ShareInput {
  key: string;
  label: string;
  value: number;
}

export interface Share extends ShareInput {
  /** Whole-number percent of the total; the slices of one chart never add up past 100. */
  percent: number;
}

/** A whole-number percent of the whole, kept between 0 and 100; zero when there is no whole. */
export const shareOfTotal = (part: number, whole: number): number => {
  if (whole <= 0) return 0;
  return Math.min(100, Math.max(0, Math.round((part / whole) * 100)));
};

/**
 * The biggest `max` slices by value and the rest folded into one slice named `othersLabel`.
 * Slices with nothing in them are left out, so a chart never draws an empty segment.
 */
export const topShares = (items: ShareInput[], max: number, othersLabel: string): Share[] => {
  const filled = items.filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const total = filled.reduce((sum, item) => sum + item.value, 0);
  if (total <= 0) return [];
  const head = filled.slice(0, max);
  const restValue = filled.slice(max).reduce((sum, item) => sum + item.value, 0);
  const slices =
    restValue > 0 ? [...head, { key: 'others', label: othersLabel, value: restValue }] : head;
  return slices.map((item) => ({ ...item, percent: Math.floor((item.value / total) * 100) }));
};
