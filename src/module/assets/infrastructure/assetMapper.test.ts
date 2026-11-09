import { describe, expect, it } from 'vitest';
import type { AssetDto } from './assetDto';
import { mapAsset, mapPaginated, mapSummary } from './assetMapper';

const dto = (overrides: Partial<AssetDto> = {}): AssetDto => ({
  id: 'a1',
  code: 'GST/001',
  name: 'Genset',
  acquisitionDate: '2026-09-12T00:00:00.000Z',
  status: 'pending',
  ...overrides,
});

describe('mapAsset', () => {
  it('keeps the calendar date of an ISO timestamp', () => {
    expect(mapAsset(dto()).acquisitionDate).toBe('2026-09-12');
    expect(mapAsset(dto({ disposalDate: '2026-10-01T00:00:00.000Z' })).disposalDate).toBe(
      '2026-10-01'
    );
  });

  it('turns missing numbers into zero and missing text into null or undefined', () => {
    const asset = mapAsset(
      dto({ acquisitionCost: null, categoryName: null, notes: '', disposalPrice: null })
    );
    expect(asset).toMatchObject({
      acquisitionCost: 0,
      residualValue: 0,
      usefulLifeYears: 0,
      netBookValue: 0,
      categoryName: null,
      categoryCode: null,
      depreciationMethod: 'straight_line',
    });
    expect(asset.notes).toBeUndefined();
    expect(asset.disposalPrice).toBeUndefined();
  });

  it('maps the values the API sends', () => {
    expect(
      mapAsset(
        dto({
          categoryCode: 'GST',
          categoryName: 'Generator Set',
          acquisitionCost: 400000000,
          netBookValue: 390000000,
          monthlyEstimate: 5000000,
          source: 'proapps',
          notes: '400V',
        })
      )
    ).toMatchObject({
      categoryCode: 'GST',
      categoryName: 'Generator Set',
      acquisitionCost: 400000000,
      netBookValue: 390000000,
      monthlyEstimate: 5000000,
      source: 'proapps',
      notes: '400V',
    });
  });
});

describe('mapAsset relations', () => {
  it('maps embedded accounts, tags and the schedule', () => {
    const asset = mapAsset(
      dto({
        status: 'active',
        assetAccount: { id: 'a', accountNumber: '1-20003', name: 'Mesin' },
        creditAccount: 'only-an-id',
        tags: [{ id: 't1', name: 'Engineering' }],
        proappsSyncError: 'gagal',
        depreciationStartDate: '2026-10-15T00:00:00.000Z',
        schedule: [{ year: 2026, months: 2, beginning: 10, expense: 1, accumulated: 1, ending: 9 }],
      })
    );
    expect(asset.assetAccount).toEqual({ id: 'a', accountNumber: '1-20003', name: 'Mesin' });
    expect(asset.creditAccount).toEqual({ id: 'only-an-id', accountNumber: '', name: '' });
    expect(asset.accumDeprAccount).toBeNull();
    expect(asset.tags).toEqual([{ id: 't1', name: 'Engineering' }]);
    expect(asset.syncError).toBe('gagal');
    expect(asset.depreciationStartDate).toBe('2026-10-15');
    expect(asset.schedule).toHaveLength(1);
  });
});

describe('mapPaginated', () => {
  it('maps each row and passes the pagination through', () => {
    const pagination = { total: 1, page: 1, limit: 10, totalPages: 1 };
    const result = mapPaginated({ data: [dto()], pagination }, mapAsset);
    expect(result.items).toHaveLength(1);
    expect(result.pagination).toEqual(pagination);
  });
});

describe('mapSummary', () => {
  it('fills every status count', () => {
    expect(mapSummary({ totalNetBookValue: 10, counts: { pending: 6 } })).toEqual({
      totalAcquisitionCost: 0,
      totalAccumulatedDepreciation: 0,
      totalNetBookValue: 10,
      counts: { pending: 6, active: 0, fully_depreciated: 0, disposed: 0 },
    });
  });
});
