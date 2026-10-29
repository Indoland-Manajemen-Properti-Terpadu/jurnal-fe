import { describe, expect, it } from 'vitest';
import { AssetItem } from '@/module/assets/domain/asset';
import {
  countAssetsByCategory,
  filterAssets,
  sortAssets,
} from '@/module/assets/domain/assetFilters';
import {
  calculateDisposalGainLoss,
  depreciationPercent,
  estimateDepreciation,
  isNonDepreciable,
  remainingPercentOfCost,
  resolveAssetStatus,
  summarizeAssets,
} from '@/module/assets/domain/depreciation';

const asset = (overrides: Partial<AssetItem>): AssetItem => ({
  id: 'a',
  code: 'AST-1',
  name: 'Asset',
  category: 'vehicle',
  acquisitionDate: '2024-01-01',
  acquisitionCost: 1000,
  residualValue: 0,
  usefulLifeYears: 5,
  depreciationMethod: 'straight_line',
  accumulatedDepreciation: 0,
  netBookValue: 1000,
  status: 'active',
  ...overrides,
});

describe('calculateDisposalGainLoss', () => {
  it('is positive above book value and negative below it', () => {
    expect(calculateDisposalGainLoss(90000000, 80000000)).toBe(10000000);
    expect(calculateDisposalGainLoss(50000000, 80000000)).toBe(-30000000);
    expect(calculateDisposalGainLoss(80000000, 80000000)).toBe(0);
  });

  it('keeps cents exact where float subtraction drifts', () => {
    // 0.3 - 0.1 is 0.19999999999999998 as a float
    expect(calculateDisposalGainLoss(0.3, 0.1)).toBe(0.2);
    expect(calculateDisposalGainLoss(1500.5, 1000.25)).toBe(500.25);
  });

  it('rounds sub-cent input half up to the cent', () => {
    expect(calculateDisposalGainLoss(10.005, 0)).toBe(10.01);
  });
});

describe('summarizeAssets', () => {
  it('sums active and fully depreciated assets and skips disposed ones', () => {
    const totals = summarizeAssets([
      asset({ acquisitionCost: 1500.5, accumulatedDepreciation: 0.1, netBookValue: 1500.4 }),
      asset({
        status: 'fully_depreciated',
        acquisitionCost: 2000.25,
        accumulatedDepreciation: 0.2,
        netBookValue: 2000.05,
      }),
      asset({ status: 'disposed', acquisitionCost: 999999 }),
    ]);
    expect(totals).toEqual({
      totalAcquisitionCost: 3500.75,
      totalAccumulatedDepreciation: 0.3,
      totalNetBookValue: 3500.45,
      activeCount: 1,
    });
  });

  it('treats missing numbers as zero', () => {
    const broken = asset({ acquisitionCost: Number.NaN });
    expect(summarizeAssets([broken]).totalAcquisitionCost).toBe(0);
  });
});

describe('small helpers', () => {
  it('estimates yearly and monthly expense', () => {
    expect(estimateDepreciation(100000000, 10000000, 5, 'straight_line')).toEqual({
      annual: 18000000,
      monthly: 1500000,
    });
    expect(estimateDepreciation(100000000, 10000000, 5, 'double_declining')).toEqual({
      annual: 40000000,
      monthly: 3333333,
    });
    expect(estimateDepreciation(100000000, 10000000, 0, 'straight_line')).toEqual({
      annual: 0,
      monthly: 0,
    });
  });

  it('computes depreciation percentages', () => {
    expect(depreciationPercent(200, 50)).toBe(25);
    expect(depreciationPercent(0, 50)).toBe(0);
    expect(depreciationPercent(100, 250)).toBe(100);
    expect(remainingPercentOfCost(200, 50)).toBe(25);
  });

  it('detects non-depreciable assets and resolves status', () => {
    expect(isNonDepreciable({ depreciationMethod: 'none', usefulLifeYears: 5 })).toBe(true);
    expect(isNonDepreciable({ depreciationMethod: 'straight_line', usefulLifeYears: 0 })).toBe(
      true
    );
    expect(resolveAssetStatus('disposed', 'straight_line', 500, 100)).toBe('disposed');
    expect(resolveAssetStatus('active', 'straight_line', 100, 100)).toBe('fully_depreciated');
    expect(resolveAssetStatus('active', 'none', 100, 100)).toBe('active');
  });
});

describe('asset filters', () => {
  const list = [
    asset({ id: '1', name: 'Truck', code: 'AST-10', category: 'vehicle', netBookValue: 5 }),
    asset({ id: '2', name: 'Office', code: 'AST-2', category: 'building', netBookValue: 50 }),
    asset({
      id: '3',
      name: 'Laptop',
      code: 'AST-1',
      category: 'electronic',
      notes: 'Dev team',
      netBookValue: 20,
    }),
  ];

  it('counts per category', () => {
    expect(countAssetsByCategory(list)).toEqual({
      all: 3,
      vehicle: 1,
      building: 1,
      machinery: 0,
      electronic: 1,
      land: 0,
    });
  });

  it('filters by category and by name, code or notes', () => {
    expect(filterAssets(list, 'vehicle', '').map((a) => a.id)).toEqual(['1']);
    expect(filterAssets(list, 'all', 'dev').map((a) => a.id)).toEqual(['3']);
    expect(filterAssets(list, 'all', ' ast-2 ').map((a) => a.id)).toEqual(['2']);
  });

  it('sorts by every key, codes numerically', () => {
    const ids = (key: string) => sortAssets([...list], key).map((a) => a.id);
    expect(ids('highestNBV')).toEqual(['2', '3', '1']);
    expect(ids('lowestNBV')).toEqual(['1', '3', '2']);
    expect(ids('nameAsc')).toEqual(['3', '2', '1']);
    expect(ids('codeAsc')).toEqual(['3', '2', '1']);
  });
});
