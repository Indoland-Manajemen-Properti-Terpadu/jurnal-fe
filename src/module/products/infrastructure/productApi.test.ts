import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_ACCOUNT } from '@/lib/http/endpoints';
import type { ProductFormValues } from '@/module/products/domain/product';
import {
  createProduct,
  fetchAccountOptions,
  fetchAllProducts,
  fetchProduct,
  fetchProducts,
  fetchTaxes,
  getApiErrorMessage,
  resolveProductImageUrl,
  updateProduct,
} from './productApi';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const formValues = (overrides: Partial<ProductFormValues> = {}): ProductFormValues => ({
  name: '  Listrik ',
  sku: ' ',
  productCategory: 'cat-1',
  unit: 'u1',
  image: null,
  buyingInfo: { isPurchased: false, unitPrice: 999, purchaseAccount: 'a', purchaseTax: 't' },
  sellingInfo: {
    isSold: true,
    unitPrice: 1500.5,
    salesAccount: 'acc-s',
    accountReceivable: 'acc-r',
    salesTax: null,
  },
  inventoryInfo: { isTracked: true, inventoryAccount: 'acc-i', minStock: 0 },
  ...overrides,
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe('fetchProduct mapping', () => {
  it('maps a full dto and reduces account and tax objects to ids', async () => {
    http.get.mockResolvedValue({
      data: {
        data: {
          id: 'p1',
          name: 'Listrik',
          sku: 'SKU-1',
          image: 'uploads/a.png',
          external_code: 'EXT',
          unit: { id: 'u1', name: 'Bulan' },
          productCategory: { id: 'c1', name: 'Utilitas', categoryCode: 'U' },
          buyingInfo: {
            isPurchased: true,
            unitPrice: 100.25,
            purchaseAccount: { id: 'acc1' },
            purchaseTax: { _id: 'tax1' },
          },
          sellingInfo: { isSold: true, unitPrice: 200, salesAccount: 'acc2', salesTax: null },
          inventoryInfo: { isTracked: true, inventoryAccount: { id: 'acc3' }, minStock: 4 },
          createdAt: '2026-01-01',
          updatedAt: '2026-01-02',
        },
      },
    });

    const product = await fetchProduct('p1');

    expect(http.get).toHaveBeenCalledWith('/v1/products/p1');
    expect(product).toEqual({
      id: 'p1',
      name: 'Listrik',
      sku: 'SKU-1',
      image: 'uploads/a.png',
      externalCode: 'EXT',
      unit: 'Bulan',
      unitId: 'u1',
      category: { id: 'c1', name: 'Utilitas' },
      buyingInfo: {
        isPurchased: true,
        unitPrice: 100.25,
        purchaseAccount: 'acc1',
        purchaseTax: 'tax1',
      },
      sellingInfo: {
        isSold: true,
        unitPrice: 200,
        salesAccount: 'acc2',
        accountReceivable: null,
        salesTax: null,
      },
      inventoryInfo: { isTracked: true, inventoryAccount: 'acc3', minStock: 4 },
      createdAt: '2026-01-01',
      updatedAt: '2026-01-02',
    });
  });

  it('falls back to legacy field names and safe defaults', async () => {
    http.get.mockResolvedValue({
      data: {
        data: {
          _id: 'p2',
          SKU: 'LEG',
          category: { _id: 'c2' },
          created_at: 'x',
          updated_at: 'y',
          externalCode: 'E2',
        },
      },
    });

    const product = await fetchProduct('p2');

    expect(product).toMatchObject({
      id: 'p2',
      name: '',
      sku: 'LEG',
      image: null,
      externalCode: 'E2',
      category: { id: 'c2', name: '' },
      createdAt: 'x',
      updatedAt: 'y',
    });
    expect(product.buyingInfo).toEqual({
      isPurchased: false,
      unitPrice: null,
      purchaseAccount: null,
      purchaseTax: null,
    });
    expect(product.inventoryInfo).toEqual({
      isTracked: false,
      inventoryAccount: null,
      minStock: 0,
    });
  });
});

describe('fetchProducts', () => {
  it('sends the paging params and drops an empty search', async () => {
    http.get.mockResolvedValue({
      data: {
        data: { data: [{ id: 'p1' }], pagination: { total: 1, page: 1, limit: 10, totalPages: 1 } },
      },
    });

    const result = await fetchProducts({ page: 1, limit: 10, search: '' });

    expect(http.get).toHaveBeenCalledWith('/v1/products', {
      params: { page: 1, limit: 10, search: undefined },
    });
    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });
});

describe('fetchProducts total', () => {
  const respond = (count: number, page: number, total: number) =>
    http.get.mockResolvedValue({
      data: {
        data: {
          data: Array.from({ length: count }, (_, k) => ({ id: `p${k}` })),
          pagination: { total, page, limit: 10, totalPages: Math.ceil(total / 10) },
        },
      },
    });

  it('ignores deleted products the service still counts on a last page that is not full', async () => {
    respond(6, 2, 19); // service says 19, but page 2 holds 6, so the real total is 16

    const { pagination } = await fetchProducts({ page: 2, limit: 10 });

    expect(pagination.total).toBe(16);
    expect(pagination.totalPages).toBe(2);
  });

  it('keeps the service total on a full page', async () => {
    respond(10, 1, 19);

    expect((await fetchProducts({ page: 1, limit: 10 })).pagination.total).toBe(19);
  });

  it('reports zero for an empty result', async () => {
    respond(0, 1, 3);

    const { pagination } = await fetchProducts({ page: 1, limit: 10 });
    expect(pagination.total).toBe(0);
    expect(pagination.totalPages).toBe(1);
  });
});

describe('fetchAllProducts', () => {
  const page = (n: number, count: number) => ({
    data: {
      data: {
        data: Array.from({ length: count }, (_, k) => ({ id: `p${n}-${k}` })),
        // the service total includes 2 deleted products
        pagination: { total: 252, page: n, limit: 100, totalPages: 3 },
      },
    },
  });

  it('reads every page, joins the items and reports the true total', async () => {
    http.get
      .mockResolvedValueOnce(page(1, 100))
      .mockResolvedValueOnce(page(2, 100))
      .mockResolvedValueOnce(page(3, 50));

    const result = await fetchAllProducts();

    expect(result.items).toHaveLength(250);
    expect(result.pagination.total).toBe(250);
    expect(http.get).toHaveBeenCalledTimes(3);
  });
});

describe('product payload', () => {
  it('posts a trimmed form-data body and omits disabled sections', async () => {
    http.post.mockResolvedValue({ data: { data: { id: 'new' } } });

    await createProduct(formValues());

    const [url, body] = http.post.mock.calls[0] as [string, FormData];
    expect(url).toBe('/v1/products');
    expect(body.get('name')).toBe('Listrik');
    expect(body.get('productCategory')).toBe('cat-1');
    expect(body.has('sku')).toBe(false);
    expect(body.get('unit')).toBe('u1');
    expect(body.get('buyingInfo[isPurchased]')).toBe('false');
    expect(body.has('buyingInfo[unitPrice]')).toBe(false);
    expect(body.get('sellingInfo[isSold]')).toBe('true');
    expect(body.get('sellingInfo[unitPrice]')).toBe('1500.5');
    expect(body.has('sellingInfo[salesTax]')).toBe(false);
    expect(body.get('inventoryInfo[isTracked]')).toBe('true');
    expect(body.get('inventoryInfo[minStock]')).toBe('0');
  });

  it('puts to the product url when updating', async () => {
    http.put.mockResolvedValue({ data: { data: { id: 'p1' } } });

    await updateProduct('p1', formValues());

    expect(http.put.mock.calls[0][0]).toBe('/v1/products/p1');
  });
});

describe('lookups', () => {
  it('returns taxes as id, name and rate', async () => {
    http.get.mockResolvedValue({
      data: { data: { data: [{ id: 't1', name: 'PPN', rate: 11, extra: 1 }] } },
    });

    expect(await fetchTaxes()).toEqual([{ id: 't1', name: 'PPN', rate: 11 }]);
    expect(http.get).toHaveBeenCalledWith('/v1/taxes', { params: { page: 1, limit: 100 } });
  });

  it('maps simple accounts into labelled options and skips non-postable ones', async () => {
    http.get.mockResolvedValue({
      data: {
        data: [
          {
            id: 'a1',
            name: 'Kas',
            accountNumber: '1-100',
            normalBalance: 'debit',
            isPostable: true,
          },
          { id: 'a2', name: 'Pendapatan', normalBalance: 'credit' },
          { id: 'a3', name: 'Induk', normalBalance: 'debit', isPostable: false },
          { id: 'a4', name: 'Tanpa sisi' },
        ],
      },
    });

    expect(await fetchAccountOptions()).toEqual([
      { id: 'a1', label: '1-100 · Kas', isDebit: true },
      { id: 'a2', label: 'Pendapatan', isDebit: false },
      { id: 'a4', label: 'Tanpa sisi', isDebit: null },
    ]);
    expect(http.get).toHaveBeenCalledWith(API_ACCOUNT.GET_SIMPLE_ACCOUNTS);
  });

  it('rejects an account response without a data array', async () => {
    http.get.mockResolvedValue({ data: {} });

    await expect(fetchAccountOptions()).rejects.toThrow('Invalid simple accounts response.');
  });
});

describe('helpers', () => {
  it('resolves relative image paths against the API host', () => {
    expect(resolveProductImageUrl(null)).toBeNull();
    expect(resolveProductImageUrl('https://cdn/x.png')).toBe('https://cdn/x.png');
    expect(resolveProductImageUrl('/uploads/x.png')).toMatch(/\/uploads\/x\.png$/);
  });

  it('prefers the API message and falls back otherwise', () => {
    expect(getApiErrorMessage(new Error('boom'), 'fallback')).toBe('fallback');
  });
});
