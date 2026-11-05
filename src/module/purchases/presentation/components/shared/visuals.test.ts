import { describe, expect, it } from 'vitest';
import { segmentGrow } from '@/module/purchases/presentation/components/shared/visuals';

describe('segmentGrow', () => {
  it('returns no segments when everything is zero', () => {
    expect(segmentGrow([{ key: 'a', value: 0, color: 'x' }])).toEqual([]);
  });

  it('gives each positive segment its share of the total', () => {
    expect(
      segmentGrow([
        { key: 'a', value: 75, color: 'x' },
        { key: 'b', value: 0, color: 'y' },
        { key: 'c', value: 25, color: 'z' },
      ])
    ).toEqual([
      { key: 'a', grow: 0.75 },
      { key: 'c', grow: 0.25 },
    ]);
  });
});
