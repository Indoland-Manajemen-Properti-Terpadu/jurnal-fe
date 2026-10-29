import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AssetItem } from '@/module/assets/domain/asset';
import { useAssets } from '@/module/assets/presentation/hooks/useAssets';

const STORAGE_KEY = 'jurnal_fixed_assets_data';

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

describe('useAssets net book value and disposal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-15T00:00:00'));
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
  });

  const seed = (asset: AssetItem) => localStorage.setItem(STORAGE_KEY, JSON.stringify([asset]));

  it('recalculates accumulated depreciation and NBV when loading', () => {
    seed(makeAsset());
    const { result } = renderHook(() => useAssets());
    const [loaded] = result.current.assets;
    expect(loaded.accumulatedDepreciation).toBe(40000000);
    expect(loaded.netBookValue).toBe(80000000);
    expect(loaded.status).toBe('active');
  });

  it('marks an asset past its life as fully depreciated', () => {
    seed(makeAsset({ acquisitionDate: '2020-01-15', usefulLifeYears: 2 }));
    const { result } = renderHook(() => useAssets());
    expect(result.current.assets[0].status).toBe('fully_depreciated');
    expect(result.current.assets[0].netBookValue).toBe(20000000);
  });

  it('disposal above book value is a gain', () => {
    seed(makeAsset());
    const { result } = renderHook(() => useAssets());
    act(() => {
      result.current.disposeAsset('a-1', '2026-01-15', 90000000);
    });
    const [disposed] = result.current.assets;
    expect(disposed.status).toBe('disposed');
    expect(disposed.disposalGainLoss).toBe(10000000);
    expect(disposed.disposalPrice).toBe(90000000);
    expect(disposed.disposalDate).toBe('2026-01-15');
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')[0].disposalGainLoss).toBe(
      10000000
    );
  });

  it('disposal below book value is a loss', () => {
    seed(makeAsset());
    const { result } = renderHook(() => useAssets());
    act(() => {
      result.current.disposeAsset('a-1', '2026-01-15', 50000000);
    });
    expect(result.current.assets[0].disposalGainLoss).toBe(-30000000);
  });

  it('disposal at book value is break-even, and a decimal price keeps its cents', () => {
    seed(makeAsset());
    const { result } = renderHook(() => useAssets());
    act(() => {
      result.current.disposeAsset('a-1', '2026-01-15', 80000000);
    });
    expect(result.current.assets[0].disposalGainLoss).toBe(0);

    localStorage.clear();
    seed(makeAsset());
    const second = renderHook(() => useAssets());
    act(() => {
      second.result.current.disposeAsset('a-1', '2026-01-15', 80000000.1);
    });
    expect(second.result.current.assets[0].disposalGainLoss).toBeCloseTo(0.1, 5);
  });

  it('a disposed asset is not recalculated on the next load', () => {
    seed(
      makeAsset({
        status: 'disposed',
        netBookValue: 1,
        accumulatedDepreciation: 2,
        disposalGainLoss: 3,
      })
    );
    const { result } = renderHook(() => useAssets());
    expect(result.current.assets[0].netBookValue).toBe(1);
  });
});
