import type {
  Procurement,
  QuoteScores,
  ScoreCriterion,
} from '@/module/purchases/domain/procurement';
import {
  allScored,
  highestScoreQuoteIds,
  lineDifference,
  weightedScore,
} from '@/module/purchases/domain/biddingScore';

const criteria: ScoreCriterion[] = [
  { key: 'price', label: 'Harga', weight: 45 },
  { key: 'spec', label: 'Spesifikasi', weight: 30 },
  { key: 'delivery', label: 'Waktu', weight: 15 },
  { key: 'term', label: 'Termin', weight: 10 },
];
const scores = (
  price: number | null,
  spec: number | null,
  delivery: number | null,
  term: number | null
): QuoteScores => ({
  price,
  spec,
  delivery,
  term,
});

describe('weightedScore', () => {
  it('is the weighted average of the four criteria', () => {
    expect(weightedScore(scores(5, 4, 3, 4), criteria)).toBeCloseTo(4.3);
    expect(weightedScore(scores(2, 3, 5, 2), criteria)).toBeCloseTo(2.75);
  });

  it('is null until every criterion is scored', () => {
    expect(weightedScore(scores(5, null, 3, 4), criteria)).toBeNull();
  });

  it('is null when the service sent no weights', () => {
    expect(weightedScore(scores(5, 5, 5, 5), [])).toBeNull();
  });
});

describe('allScored', () => {
  it('tells whether every criterion has a value', () => {
    expect(allScored(scores(1, 2, 3, 4))).toBe(true);
    expect(allScored(scores(1, null, 3, 4))).toBe(false);
  });
});

describe('highestScoreQuoteIds', () => {
  const totals = (list: [string, number | null][]) =>
    ({
      totals: Object.fromEntries(list.map(([id, score]) => [id, { score }])),
    }) as unknown as Procurement;

  it('names the quote with the highest score', () => {
    expect(
      highestScoreQuoteIds(
        totals([
          ['a', 4.3],
          ['b', 2.75],
        ])
      )
    ).toEqual(['a']);
  });

  it('names every quote on a tie', () => {
    expect(
      highestScoreQuoteIds(
        totals([
          ['a', 4],
          ['b', 4],
        ])
      )
    ).toEqual(['a', 'b']);
  });

  it('names none while fewer than two quotes are scored', () => {
    expect(
      highestScoreQuoteIds(
        totals([
          ['a', 4],
          ['b', null],
        ])
      )
    ).toEqual([]);
  });
});

describe('lineDifference', () => {
  it('is how far a line is above the cheapest vendor line, never negative', () => {
    expect(lineDifference(4400000, [4000000, 4400000])).toBe(400000);
    expect(lineDifference(4000000, [4000000, 4400000])).toBe(0);
  });
});
