import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ActivationValues, AssetFormValues } from '@/module/assets/domain/asset';
import {
  activateAsset,
  createAsset,
  fetchAsset,
  fetchAssetAccounts,
  fetchAssetAccountsOfKind,
  fetchDisposalPreview,
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
  brand: '',
  modelType: '',
  serialNumber: '',
  warrantyUntil: '',
  condition: '',
  location: '',
  vendorContactId: '',
  photos: [],
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
      lines: [{ accountNumber: '1-20003', accountName: 'Mesin', debit: 100, credit: 0 }],
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
      brand: undefined,
      modelType: undefined,
      serialNumber: undefined,
      warrantyUntil: undefined,
      condition: undefined,
      location: undefined,
      vendorContactId: undefined,
      photos: undefined,
      tags: ['t1'],
      activation: undefined,
    });
  });

  it('sends a multipart body when photos are picked from the device', async () => {
    const photo = new File(['x'], 'depan.png', { type: 'image/png' });
    await createAsset(values({ photoFiles: [photo], tagIds: ['t1'] }));
    const [url, body] = http.post.mock.calls.at(-1) as [string, FormData];
    expect(url).toBe('/v1/assets');
    expect(body).toBeInstanceOf(FormData);
    expect(body.get('code')).toBe('ZZ/1');
    expect(body.get('acquisitionCost')).toBe('12000000');
    expect(body.get('tags')).toBe('["t1"]');
    expect(body.getAll('photos')).toHaveLength(1);
    expect((body.get('photos') as File).name).toBe('depan.png');
  });

  it('sends the optional details and the vendor contact when they are filled', async () => {
    await createAsset(
      values({
        brand: ' Ricoh ',
        serialNumber: 'SN1',
        warrantyUntil: '2027-01-01',
        condition: 'new',
        location: ' Gudang ',
        vendorContactId: 'c1',
        photos: ['https://x.test/a.jpg'],
      })
    );
    expect(http.post.mock.calls[0][1]).toMatchObject({
      brand: 'Ricoh',
      serialNumber: 'SN1',
      warrantyUntil: '2027-01-01',
      condition: 'new',
      location: 'Gudang',
      vendorContactId: 'c1',
      photos: ['https://x.test/a.jpg'],
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
      brand: null,
      modelType: null,
      serialNumber: null,
      warrantyUntil: null,
      condition: null,
      location: null,
      vendorContactId: null,
      photos: [],
      tags: ['t1'],
    });
  });

  it('sends only the tags for an asset pushed from ProApps', async () => {
    await updateAsset('a1', values(), { details: false, terms: false, tags: true });
    expect(http.patch).toHaveBeenCalledWith('/v1/assets/a1', { tags: ['t1'] });
  });

  it('reads the accounts of one group from the simple list', async () => {
    http.get.mockResolvedValue({
      data: {
        data: [
          { id: 'x1', name: 'Mesin', accountNumber: '1-20003', isPostable: true },
          { id: 'x2', name: 'Induk', accountNumber: '1-20000', isPostable: false },
        ],
      },
    });
    expect(await fetchAssetAccountsOfKind('fixed_asset')).toEqual([
      { id: 'x1', name: 'Mesin', accountNumber: '1-20003', type: '' },
    ]);
    expect(http.get).toHaveBeenCalledWith('/v1/accounts/simple', {
      params: { type: 'fixed_asset' },
    });
  });

  it('asks the API what a disposal would book', async () => {
    http.get.mockResolvedValue({
      data: {
        data: {
          catchUpDepreciation: 10,
          accumulatedDepreciation: 20,
          bookValue: 30,
          gainLoss: -30,
        },
      },
    });
    expect(await fetchDisposalPreview('a1', '2026-11-16', 0)).toEqual({
      catchUpDepreciation: 10,
      accumulatedDepreciation: 20,
      bookValue: 30,
      gainLoss: -30,
    });
    expect(http.get).toHaveBeenCalledWith('/v1/assets/a1/dispose-preview', {
      params: { disposalDate: '2026-11-16', disposalPrice: 0 },
    });
  });

  it('uses the API message for an error and the fallback otherwise', () => {
    const apiError = Object.assign(new Error('x'), {
      isAxiosError: true,
      response: { data: { message: 'Kode sudah dipakai' } },
    });
    expect(getApiErrorMessage(apiError, 'fallback')).toBe('Kode sudah dipakai');
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });

  it('hides validation messages that name a raw field', () => {
    const joi = (message: string) =>
      Object.assign(new Error('x'), { isAxiosError: true, response: { data: { message } } });
    expect(getApiErrorMessage(joi('"reason" is required'), 'fallback')).toBe('fallback');
    expect(
      getApiErrorMessage(joi('"reason" length must be at least 3 characters long'), 'fallback')
    ).toBe('fallback');
    expect(getApiErrorMessage(joi('""assetId"" must be a valid mongo id'), 'fallback')).toBe(
      'fallback'
    );
  });
});
