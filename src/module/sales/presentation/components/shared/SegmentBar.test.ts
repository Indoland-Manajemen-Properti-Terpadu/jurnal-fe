import { describe, expect, it } from 'vitest';
import { segmentGrow } from './SegmentBar';

const seg = (key: string, value: number) => ({ key, label: key, value, color: 'x' });

describe('segmentGrow', () => {
  it('gives each segment its share of the positive total', () => {
    expect(segmentGrow([seg('a', 75), seg('b', 25)])).toEqual([
      { key: 'a', grow: 0.75 },
      { key: 'b', grow: 0.25 },
    ]);
  });

  it('drops empty segments and returns nothing when all are zero', () => {
    expect(segmentGrow([seg('a', 0), seg('b', 10)])).toEqual([{ key: 'b', grow: 1 }]);
    expect(segmentGrow([seg('a', 0), seg('b', 0)])).toEqual([]);
  });
});
