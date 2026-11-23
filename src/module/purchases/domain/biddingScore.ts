import type {
  Procurement,
  QuoteScores,
  ScoreCriterion,
  ScoreKey,
} from '@/module/purchases/domain/procurement';

const KEYS: ScoreKey[] = ['price', 'spec', 'delivery', 'term'];

/** Every criterion has a value from 1 to 5. */
export const allScored = (scores: QuoteScores): boolean =>
  KEYS.every((key) => scores[key] !== null);

/**
 * The weighted average of the criteria, 1 to 5, as the service computes it: shown at once while the
 * person scores, replaced by the service's figure after the save. Null until all four are scored.
 */
export const weightedScore = (scores: QuoteScores, criteria: ScoreCriterion[]): number | null => {
  if (!allScored(scores)) return null;
  const weight = criteria.reduce((sum, criterion) => sum + criterion.weight, 0);
  if (weight <= 0) return null;
  const total = criteria.reduce(
    (sum, criterion) => sum + (scores[criterion.key] as number) * criterion.weight,
    0
  );
  return total / weight;
};

/**
 * The quote(s) with the highest score, for the "highest" label. Naming one needs at least two
 * scored quotes to compare.
 */
export const highestScoreQuoteIds = (procurement: Procurement): string[] => {
  const scored = Object.entries(procurement.totals).flatMap(([id, totals]) =>
    totals.score === null ? [] : [[id, totals.score] as const]
  );
  if (scored.length < 2) return [];
  const top = Math.max(...scored.map(([, score]) => score));
  return scored.filter(([, score]) => score === top).map(([id]) => id);
};

/** How far a line total is above the cheapest vendor's line for the same item. */
export const lineDifference = (lineTotal: number, allLineTotals: number[]): number =>
  Math.max(0, lineTotal - Math.min(...allLineTotals));
