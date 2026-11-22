import { beforeEach, describe, expect, it, vi } from 'vitest';
import { listDepartments, listUnits } from './purchaseLookupApi';

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
