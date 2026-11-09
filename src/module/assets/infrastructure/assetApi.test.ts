import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivationValues, AssetFormValues } from '@/module/assets/domain/asset';
import {
  activateAsset,
  createAsset,
  disposeAsset,
  fetchAsset,
  fetchAssetAccounts,
  fetchAssetJournals,
  fetchAssetSummary,
  fetchAssetTags,
  fetchAssets,
  getApiErrorMessage,
  reviseAssetActivation,
  updateAsset,
} from './assetApi';

const http = vi.hoisted(() => ({ get: vi.fn(), post: vi.fn(), patch: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const assetDto = {
  id: 'a1',
  code: 'C',
  name: 'N',
  acquisitionDate: '2026-01-02T00:00:00.000Z',
  status: 'pending',
};
const values = (overrides: Partial<AssetFormValues> = {}): AssetFormValues => ({
  code: ' ZZ/1 ',
  name: ' Laptop ',
  categoryName: ' IT ',
  acquisitionDate: '2026-11-01',
  acquisitionCost: 12000000,
  notes: ' baru ',
  tagIds: ['t1'],
  ...overrides,
});
const activation = (overrides: Partial<ActivationValues> = {}): ActivationValues => ({
  assetAccount: 'acc-asset',
  creditAccount: 'acc-credit',
  accumDeprAccount: 'acc-accum',
  deprExpenseAccount: 'acc-expense',
  depreciationMethod: 'straight_line',
  usefulLifeYears: 4,
  residualValue: 2000000,
  accumulatedDepreciation: 0,
  depreciationStartDate: '',
  ...overrides,
});

describe('assetApi reads', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists assets with the query params and drops an empty search', async () => {
    http.get.mockResolvedValue({
      data: {
        data: { data: [assetDto], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } },
      },
    });
    const result = await fetchAssets({ page: 1, limit: 10, status: 'pending', search: '' });
    expect(http.get).toHaveBeenCalledWith('/v1/assets', {
      params: { page: 1, limit: 10, status: 'pending', search: undefined },
    });
    expect(result.items[0].acquisitionDate).toBe('2026-01-02');
    expect(result.pagination.total).toBe(1);
  });

  it('reads one asset, the summary and the journals', async () => {
    http.get.mockResolvedValueOnce({ data: { data: assetDto } });
    expect((await fetchAsset('a1')).id).toBe('a1');
    expect(http.get).toHaveBeenCalledWith('/v1/assets/a1');

    http.get.mockResolvedValueOnce({
      data: { data: { totalNetBookValue: 5, counts: { active: 2 } } },
    });
    expect((await fetchAssetSummary()).counts.active).toBe(2);
    expect(http.get).toHaveBeenLastCalledWith('/v1/assets/summary');

    http.get.mockResolvedValueOnce({
      data: {
        data: [
          {
            id: 'j1',
            transactionNumber: 12215,
            transactionDate: '2026-10-15T00:00:00.000Z',
            status: 'ACTIVE',
            notes: 'Perolehan Aset',
            transactionDetail: [
              { account: { accountNumber: '1-20003', name: 'Mesin' }, debit: 100, credit: 0 },
            ],
          },
        ],
      },
    });
    const journals = await fetchAssetJournals('a1');
    expect(http.get).toHaveBeenLastCalledWith('/v1/assets/a1/journals');
    expect(journals[0]).toMatchObject({
      date: '2026-10-15',
      lines: [{ account: '1-20003 · Mesin' }],
    });
  });

  it('reads the tags and flattens the postable accounts', async () => {
    http.get.mockResolvedValueOnce({
      data: { data: { data: [{ id: 't1', name: 'Fitout' }], pagination: {} } },
    });
    expect(await fetchAssetTags()).toEqual([{ id: 't1', name: 'Fitout' }]);

    http.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            id: 'head',
            name: 'Aktiva Tetap',
            isPostable: false,
            type: 'Aktiva Tetap',
            subAccount: [
              {
                id: 'm',
                name: 'Mesin',
                accountNumber: '1-20003',
                type: 'Aktiva Tetap',
                isPostable: true,
              },
              { id: 'x', name: 'Lama', type: 'Aktiva Tetap', isPostable: true, isArchived: true },
            ],
          },
        ],
      },
    });
    expect(await fetchAssetAccounts()).toEqual([
      { id: 'm', accountNumber: '1-20003', name: 'Mesin', type: 'Aktiva Tetap' },
    ]);
  });
});

describe('assetApi writes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    http.post.mockResolvedValue({ data: { data: assetDto } });
    http.patch.mockResolvedValue({ data: { data: assetDto } });
  });

  it('creates a pending asset with trimmed text and no activation block', async () => {
    await createAsset(values({ categoryName: ' ', notes: '' }));
    expect(http.post).toHaveBeenCalledWith('/v1/assets', {
      code: 'ZZ/1',
      name: 'Laptop',
      categoryName: undefined,
      acquisitionDate: '2026-11-01',
      acquisitionCost: 12000000,
      notes: undefined,
      tags: ['t1'],
      activation: undefined,
    });
  });

  it('creates an active asset by adding the activation block', async () => {
    await createAsset(values(), activation());
    expect(http.post.mock.calls[0][1].activation).toEqual({
      assetAccount: 'acc-asset',
      creditAccount: 'acc-credit',
      accumDeprAccount: 'acc-accum',
      deprExpenseAccount: 'acc-expense',
      depreciationMethod: 'straight_line',
      usefulLifeYears: 4,
      residualValue: 2000000,
      accumulatedDepreciation: 0,
      depreciationStartDate: null,
    });
  });

  it('sends a zero life and no depreciation accounts when the asset is not depreciated', async () => {
    await activateAsset(
      'a1',
      activation({ depreciationMethod: 'none', accumDeprAccount: '', deprExpenseAccount: '' })
    );
    expect(http.post).toHaveBeenCalledWith(
      '/v1/assets/a1/activate',
      expect.objectContaining({
        depreciationMethod: 'none',
        usefulLifeYears: 0,
        accumDeprAccount: undefined,
        deprExpenseAccount: undefined,
      })
    );
  });

  it('revises an asset through the activation block of a PATCH', async () => {
    await reviseAssetActivation('a1', activation({ depreciationStartDate: '2026-02-01' }));
    expect(http.patch).toHaveBeenCalledWith('/v1/assets/a1', {
      activation: expect.objectContaining({ depreciationStartDate: '2026-02-01' }),
    });
  });

  it('disposes with the proceeds and gain/loss accounts', async () => {
    await disposeAsset('a1', {
      disposalDate: '2026-10-20',
      disposalPrice: 3000000,
      proceedsAccount: 'p',
      gainLossAccount: '',
    });
    expect(http.post).toHaveBeenCalledWith('/v1/assets/a1/dispose', {
      disposalDate: '2026-10-20',
      disposalPrice: 3000000,
      proceedsAccount: 'p',
      gainLossAccount: undefined,
    });
  });

  it('edits everything for a pending asset made in Jurnal, clearing empty notes', async () => {
    await updateAsset('a1', values({ categoryName: '', notes: '' }), {
      details: true,
      terms: true,
      tags: true,
    });
    expect(http.patch).toHaveBeenCalledWith('/v1/assets/a1', {
      name: 'Laptop',
      categoryName: '',
      notes: null,
      code: 'ZZ/1',
      acquisitionDate: '2026-11-01',
      acquisitionCost: 12000000,
      tags: ['t1'],
    });
  });

  it('sends only the tags for an asset pushed from ProApps', async () => {
    await updateAsset('a1', values(), { details: false, terms: false, tags: true });
    expect(http.patch).toHaveBeenCalledWith('/v1/assets/a1', { tags: ['t1'] });
  });

  it('uses the API message for an error and the fallback otherwise', () => {
    const apiError = Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { data: { message: 'Kode sudah dipakai' } },
    });
    expect(getApiErrorMessage(apiError, 'fallback')).toBe('Kode sudah dipakai');
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
