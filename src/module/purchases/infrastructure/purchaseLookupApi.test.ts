import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listDepartments, listPaymentTerms, listUnits, listWarehouses } from './purchaseLookupApi';

const http = vi.hoisted(() => ({ get: vi.fn() }));
vi.mock('@/lib/http/apiClient', () => ({ default: http }));

beforeEach(() => {
  vi.clearAllMocks();
});

describe('listDepartments', () => {
  it('asks only for active departments, up to the service limit', async () => {
    http.get.mockResolvedValue({
      data: { data: { results: [{ id: 'd1', name: 'Engineering', code: '' }] } },
    });

    const departments = await listDepartments();

    expect(http.get).toHaveBeenCalledWith('/v1/departments', {
      params: { isActive: true, limit: 200 },
      timeout: expect.any(Number),
    });
    expect(departments).toEqual([{ id: 'd1', name: 'Engineering' }]);
  });
});

describe('listUnits', () => {
  it('stays within the 100 units per page the service allows', async () => {
    http.get.mockResolvedValue({ data: { data: { data: [{ id: 'u1', name: 'Bulan' }] } } });

    const units = await listUnits();

    expect(http.get).toHaveBeenCalledWith('/v1/units', {
      params: { limit: 100 },
      timeout: expect.any(Number),
    });
    expect(units).toEqual([{ id: 'u1', name: 'Bulan' }]);
  });
});

describe('listPaymentTerms', () => {
  const row = { id: 't1', name: 'Net 30', summary: { dueLabel: 'Jatuh tempo 30 hari' } };

  it('asks only for the terms of one kind when told', async () => {
    http.get.mockResolvedValue({ data: { data: [row] } });

    const terms = await listPaymentTerms('service');

    expect(http.get).toHaveBeenCalledWith('/v1/payment-terms/options', {
      params: { appliesTo: 'service' },
      timeout: expect.any(Number),
    });
    expect(terms[0]).toMatchObject({ id: 't1', name: 'Net 30', dueLabel: 'Jatuh tempo 30 hari' });
  });

  it('sends no kind to get every active term', async () => {
    http.get.mockResolvedValue({ data: { data: [row] } });

    await listPaymentTerms();

    expect(http.get).toHaveBeenCalledWith('/v1/payment-terms/options', {
      params: {},
      timeout: expect.any(Number),
    });
  });
});

describe('listWarehouses', () => {
  it('keeps which warehouse is the main one', async () => {
    http.get.mockResolvedValue({
      data: {
        data: {
          results: [
            { id: 'w1', name: 'Gudang lt 10', isDefault: true },
            { id: 'w2', name: 'Gudang Cadangan' },
          ],
        },
      },
    });

    const warehouses = await listWarehouses();

    expect(warehouses).toEqual([
      { id: 'w1', name: 'Gudang lt 10', isDefault: true },
      { id: 'w2', name: 'Gudang Cadangan', isDefault: false },
    ]);
  });
});
