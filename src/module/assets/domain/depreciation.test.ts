import { describe, expect, it } from 'vitest';
import {
  depreciationEndMonth,
  depreciationPercent,
  estimateDepreciation,
  isNonDepreciable,
  remainingLifeMonths,
  toSafeNumber,
} from '@/module/assets/domain/depreciation';

describe('estimateDepreciation', () => {
  it('spreads cost minus residual over the useful life for straight line', () => {
    expect(estimateDepreciation(13000000, 2000000, 4, 'straight_line')).toEqual({
      annual: 2750000,
      monthly: 229167,
    });
  });

  it('takes twice the straight-line rate of the cost for double declining', () => {
    expect(estimateDepreciation(12500000, 1000000, 5, 'double_declining')).toEqual({
      annual: 5000000,
      monthly: 416667,
    });
  });

  it('is zero without a method or a useful life', () => {
    expect(estimateDepreciation(1000, 0, 5, 'none')).toEqual({ annual: 0, monthly: 0 });
    expect(estimateDepreciation(1000, 0, 0, 'straight_line')).toEqual({ annual: 0, monthly: 0 });
  });
});

describe('small helpers', () => {
  it('treats unusable values as zero', () => {
    expect(toSafeNumber(undefined)).toBe(0);
    expect(toSafeNumber('12')).toBe(12);
    expect(toSafeNumber(Number.NaN)).toBe(0);
  });

  it('knows an asset without depreciation', () => {
    expect(isNonDepreciable({ depreciationMethod: 'none', usefulLifeYears: 5 })).toBe(true);
    expect(isNonDepreciable({ depreciationMethod: 'straight_line', usefulLifeYears: 0 })).toBe(
      true
    );
    expect(isNonDepreciable({ depreciationMethod: 'straight_line', usefulLifeYears: 4 })).toBe(
      false
    );
  });

  it('caps the depreciated share at 100 percent', () => {
    expect(depreciationPercent(1000, 250)).toBe(25);
    expect(depreciationPercent(1000, 5000)).toBe(100);
    expect(depreciationPercent(0, 10)).toBe(0);
  });
});

describe('useful life left', () => {
  const genset = {
    depreciationMethod: 'straight_line' as const,
    usefulLifeYears: 8,
    depreciationStartDate: '2026-09-12',
    acquisitionDate: '2026-09-12',
  };

  it('ends the useful life the given number of years after the start month', () => {
    expect(depreciationEndMonth(genset)).toBe('2034-09-01');
    expect(depreciationEndMonth({ ...genset, depreciationStartDate: undefined })).toBe(
      '2034-09-01'
    );
  });

  it('counts the months left from today and stops at zero', () => {
    expect(remainingLifeMonths(genset, '2026-11-09')).toBe(94);
    expect(remainingLifeMonths(genset, '2040-01-01')).toBe(0);
  });

  it('has no end without a useful life', () => {
    expect(depreciationEndMonth({ ...genset, depreciationMethod: 'none' })).toBeUndefined();
    expect(remainingLifeMonths({ ...genset, usefulLifeYears: 0 }, '2026-11-09')).toBe(0);
  });
});
