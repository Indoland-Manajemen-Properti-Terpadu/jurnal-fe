import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetItem } from '@/module/assets/domain/asset';
import {
  calculateAssetDepreciation,
  generateDepreciationSchedule,
} from '@/module/assets/domain/depreciation';

const makeAsset = (overrides: Partial<AssetItem> = {}): AssetItem => ({
  id: 'a-1',
  code: 'AST-1',
  name: 'Test asset',
  category: 'machinery',
  acquisitionDate: '2024-01-15',
  acquisitionCost: 120000000,
  residualValue: 20000000,
  usefulLifeYears: 5,
  depreciationMethod: 'straight_line',
  accumulatedDepreciation: 0,
  netBookValue: 120000000,
  status: 'active',
  ...overrides,
});

describe('depreciation rules', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T00:00:00'));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  describe('calculateAssetDepreciation', () => {
    it('straight line: 24 months of a 5 year life', () => {
      expect(
        calculateAssetDepreciation(120000000, 20000000, 5, 'straight_line', '2024-01-15')
      ).toEqual({ accumulatedDepreciation: 40000000, netBookValue: 80000000 });
    });

    it('straight line rounds the accumulated amount to whole rupiah', () => {
      // 100,000,000 / 36 months = 2,777,777.78 per month, 5 months elapsed
      expect(
        calculateAssetDepreciation(110000000, 10000000, 3, 'straight_line', '2025-08-15')
      ).toEqual({ accumulatedDepreciation: 13888889, netBookValue: 96111111 });
    });

    it('straight line with a decimal useful life (2.5 years = 30 months)', () => {
      expect(calculateAssetDepreciation(60000000, 0, 2.5, 'straight_line', '2025-01-15')).toEqual({
        accumulatedDepreciation: 24000000,
        netBookValue: 36000000,
      });
    });

    it('straight line is capped at the residual value after the useful life', () => {
      expect(
        calculateAssetDepreciation(120000000, 20000000, 2, 'straight_line', '2020-01-15')
      ).toEqual({ accumulatedDepreciation: 100000000, netBookValue: 20000000 });
    });

    it('a future acquisition date depreciates nothing', () => {
      expect(
        calculateAssetDepreciation(120000000, 20000000, 5, 'straight_line', '2027-01-15')
      ).toEqual({ accumulatedDepreciation: 0, netBookValue: 120000000 });
    });

    it('double declining: two full years at 40% a year', () => {
      expect(
        calculateAssetDepreciation(100000000, 10000000, 5, 'double_declining', '2024-01-15')
      ).toEqual({ accumulatedDepreciation: 64000000, netBookValue: 36000000 });
    });

    it('double declining with a partial year', () => {
      // 18 months: one full year (60M left) then half a year at 40%: 60M * 0.4 * 0.5 = 12M
      expect(
        calculateAssetDepreciation(100000000, 10000000, 5, 'double_declining', '2024-07-15')
      ).toEqual({ accumulatedDepreciation: 52000000, netBookValue: 48000000 });
    });

    it('double declining reaches the residual value at the end of the useful life, like the schedule', () => {
      const asset = {
        acquisitionCost: 100000000,
        residualValue: 0,
        usefulLifeYears: 5,
        depreciationMethod: 'double_declining' as const,
        acquisitionDate: '2020-01-01',
      };
      const afterLife = calculateAssetDepreciation(
        100000000,
        0,
        5,
        'double_declining',
        '2020-01-01',
        new Date('2026-01-01')
      );
      const lastRow = generateDepreciationSchedule(makeAsset(asset)).at(-1);

      expect(afterLife).toEqual({ accumulatedDepreciation: 100000000, netBookValue: 0 });
      expect(lastRow?.endingBookValue).toBe(afterLife.netBookValue);
      expect(lastRow?.accumulatedDepreciation).toBe(afterLife.accumulatedDepreciation);
    });

    it('double declining agrees with the schedule at every year end', () => {
      const asset = makeAsset({
        acquisitionCost: 100000000,
        residualValue: 10000000,
        usefulLifeYears: 5,
        depreciationMethod: 'double_declining',
        acquisitionDate: '2020-01-01',
      });
      const schedule = generateDepreciationSchedule(asset);

      schedule.forEach((row, index) => {
        const result = calculateAssetDepreciation(
          100000000,
          10000000,
          5,
          'double_declining',
          '2020-01-01',
          new Date(2020 + index + 1, 0, 1)
        );
        expect(result.netBookValue).toBe(row.endingBookValue);
      });
    });

    it('method none or zero life keeps the cost', () => {
      expect(calculateAssetDepreciation(500000, 500000, 0, 'none', '2020-01-01')).toEqual({
        accumulatedDepreciation: 0,
        netBookValue: 500000,
      });
      expect(calculateAssetDepreciation(500000, 0, 0, 'straight_line', '2020-01-01')).toEqual({
        accumulatedDepreciation: 0,
        netBookValue: 500000,
      });
    });
  });

  describe('generateDepreciationSchedule', () => {
    it('straight line: five equal years ending on the residual value', () => {
      const schedule = generateDepreciationSchedule(makeAsset());
      expect(schedule).toHaveLength(5);
      expect(schedule[0]).toEqual({
        yearNumber: 1,
        yearDate: '2024',
        beginningBookValue: 120000000,
        depreciationExpense: 20000000,
        accumulatedDepreciation: 20000000,
        endingBookValue: 100000000,
      });
      expect(schedule[4]).toEqual({
        yearNumber: 5,
        yearDate: '2028',
        beginningBookValue: 40000000,
        depreciationExpense: 20000000,
        accumulatedDepreciation: 100000000,
        endingBookValue: 20000000,
      });
    });

    it('straight line: the last year absorbs the rounding remainder', () => {
      const schedule = generateDepreciationSchedule(
        makeAsset({ acquisitionCost: 100000000, residualValue: 0, usefulLifeYears: 3 })
      );
      expect(schedule.map((row) => row.depreciationExpense)).toEqual([
        33333333, 33333333, 33333334,
      ]);
      expect(schedule[2].endingBookValue).toBe(0);
    });

    it('straight line with a decimal useful life only produces whole years', () => {
      const schedule = generateDepreciationSchedule(
        makeAsset({ acquisitionCost: 60000000, residualValue: 0, usefulLifeYears: 2.5 })
      );
      expect(schedule).toHaveLength(2);
      expect(schedule.map((row) => row.depreciationExpense)).toEqual([24000000, 24000000]);
      expect(schedule[1].endingBookValue).toBe(12000000);
    });

    it('double declining: 40% a year, last year closes to the residual value', () => {
      const schedule = generateDepreciationSchedule(
        makeAsset({
          acquisitionCost: 100000000,
          residualValue: 10000000,
          usefulLifeYears: 5,
          depreciationMethod: 'double_declining',
        })
      );
      expect(schedule.map((row) => row.depreciationExpense)).toEqual([
        40000000, 24000000, 14400000, 8640000, 2960000,
      ]);
      expect(schedule[4].endingBookValue).toBe(10000000);
      expect(schedule[4].accumulatedDepreciation).toBe(90000000);
    });

    it('a non-depreciable asset yields one row with the cost', () => {
      const schedule = generateDepreciationSchedule(
        makeAsset({ depreciationMethod: 'none', usefulLifeYears: 0, acquisitionCost: 750000 })
      );
      expect(schedule).toEqual([
        {
          yearNumber: 1,
          yearDate: '2024',
          beginningBookValue: 750000,
          depreciationExpense: 0,
          accumulatedDepreciation: 0,
          endingBookValue: 750000,
        },
      ]);
    });
  });
});
