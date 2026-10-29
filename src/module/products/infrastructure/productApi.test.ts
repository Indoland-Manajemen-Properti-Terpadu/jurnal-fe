import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ProductFormValues } from '@/module/products/domain/product';
import {
  createProduct,
  fetchAccountOptions,
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

describe('product payload', () => {
  it('posts a trimmed form-data body and omits disabled sections', async () => {
    http.post.mockResolvedValue({ data: { data: { id: 'new' } } });

    await createProduct(formValues());

    const [url, body] = http.post.mock.calls[0] as [string, FormData];
    expect(url).toBe('/v1/products');
    expect(body.get('name')).toBe('Listrik');
    expect(body.get('productCategory')).toBe('cat-1');
    expect(body.has('sku')).toBe(false);
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

  it('flattens account trees into labelled options', async () => {
    http.get.mockResolvedValue({
      data: {
        results: [
          {
            id: 'a1',
            name: 'Kas',
            accountNumber: '1-100',
            subAccount: [{ id: 'a2', name: 'Kas Kecil' }],
          },
        ],
      },
    });

    expect(await fetchAccountOptions()).toEqual([
      { id: 'a1', label: '1-100 · Kas' },
      { id: 'a2', label: 'Kas Kecil' },
    ]);
  });

  it('rejects an account response without a results array', async () => {
    http.get.mockResolvedValue({ data: {} });

    await expect(fetchAccountOptions()).rejects.toThrow('Invalid journal accounts response.');
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
