import { AxiosError, type AxiosResponse } from 'axios';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/http/apiError';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  toDepartment,
  updateDepartment,
} from './departmentApi';

const http = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('@/lib/http/apiClient', () => ({ default: http }));

const refused = (status: number, data: unknown) =>
  new AxiosError('failed', 'ERR', undefined, undefined, {
    status,
    data,
    statusText: '',
    headers: {},
    config: {},
  } as AxiosResponse);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('toDepartment', () => {
  it('fills missing text with empty strings and treats a missing flag as active', () => {
    expect(toDepartment({ id: 'd1', name: 'Security', code: null })).toEqual({
      id: 'd1',
      name: 'Security',
      code: '',
      description: '',
      isActive: true,
    });
    expect(toDepartment({ id: 'd2', name: 'Old', isActive: false }).isActive).toBe(false);
  });
});

describe('fetchDepartments', () => {
  it('sends only the chosen filters, keeping isActive false', async () => {
    http.get.mockResolvedValue({ data: { data: { results: [], page: 1, totalPages: 0 } } });

    await fetchDepartments({ search: '  eng ', isActive: false, page: 2, limit: 20 });

    expect(http.get).toHaveBeenCalledWith('/v1/departments', {
      params: { search: 'eng', isActive: false, page: 2, limit: 20 },
    });
  });

  it('sends no filter at all when none is chosen', async () => {
    http.get.mockResolvedValue({ data: { data: {} } });

    const page = await fetchDepartments({ search: '   ' });

    expect(http.get).toHaveBeenCalledWith('/v1/departments', { params: {} });
    expect(page).toEqual({ items: [], page: 1, totalPages: 0, totalResults: 0 });
  });

  it('maps the results and the paging', async () => {
    http.get.mockResolvedValue({
      data: {
        data: {
          results: [{ id: 'd1', name: 'Engineering', code: '', description: '', isActive: true }],
          page: 1,
          totalPages: 3,
          totalResults: 5,
        },
      },
    });

    const page = await fetchDepartments();

    expect(page.items.map((item) => item.name)).toEqual(['Engineering']);
    expect(page).toMatchObject({ totalPages: 3, totalResults: 5 });
  });
});

describe('writing', () => {
  const input = { name: 'Procurement', code: 'PRC', description: '', isActive: true };

  it('creates, updates and deletes under /v1/departments', async () => {
    http.post.mockResolvedValue({ data: { data: { id: 'd9', ...input } } });
    http.put.mockResolvedValue({ data: { data: { id: 'd9', ...input, isActive: false } } });
    http.delete.mockResolvedValue({ data: { code: 200 } });

    expect((await createDepartment(input)).id).toBe('d9');
    expect((await updateDepartment('d9', { isActive: false })).isActive).toBe(false);
    await deleteDepartment('d9');

    expect(http.post).toHaveBeenCalledWith('/v1/departments', input);
    expect(http.put).toHaveBeenCalledWith('/v1/departments/d9', { isActive: false });
    expect(http.delete).toHaveBeenCalledWith('/v1/departments/d9');
  });

  it('turns a duplicate name into a domain error that carries the Indonesian message', async () => {
    http.post.mockRejectedValue(refused(400, { message: 'Nama departemen sudah dipakai' }));

    const error = await createDepartment(input).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ kind: 'domain', serverMessage: 'Nama departemen sudah dipakai' });
  });

  it('turns a missing department into a not-found error', async () => {
    http.delete.mockRejectedValue(refused(404, { message: 'Departemen tidak ditemukan' }));

    await expect(deleteDepartment('gone')).rejects.toMatchObject({ kind: 'notFound' });
  });
});
