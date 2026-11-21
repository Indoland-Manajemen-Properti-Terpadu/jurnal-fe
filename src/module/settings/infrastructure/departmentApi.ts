import apiClient from '@/lib/http/apiClient';
import { toApiError } from '@/lib/http/apiError';
import type { Department, DepartmentInput } from '@/module/settings/domain/department';

const DEPARTMENTS = '/v1/departments';

type Envelope<T> = { code?: number; message?: string; data: T };

/** What the API sends; the text fields are empty strings, never missing, on a stored department. */
export interface DepartmentDto {
  id: string;
  name: string;
  code?: string | null;
  description?: string | null;
  isActive?: boolean | null;
}

interface DepartmentListDto {
  results?: DepartmentDto[] | null;
  page?: number;
  totalPages?: number;
  totalResults?: number;
}

export interface DepartmentListParams {
  search?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface DepartmentPage {
  items: Department[];
  page: number;
  totalPages: number;
  totalResults: number;
}

export const toDepartment = (dto: DepartmentDto): Department => ({
  id: dto.id,
  name: dto.name,
  code: dto.code ?? '',
  description: dto.description ?? '',
  isActive: dto.isActive !== false,
});

/** Only the filters the person chose; `isActive: false` is a real choice and stays. */
const toQuery = (params: DepartmentListParams): Record<string, string | number | boolean> => {
  const query: Record<string, string | number | boolean> = {};
  const search = params.search?.trim();
  if (search) query.search = search;
  if (params.isActive !== undefined) query.isActive = params.isActive;
  if (params.page) query.page = params.page;
  if (params.limit) query.limit = params.limit;
  return query;
};

const call = async <T>(request: () => Promise<{ data: T }>): Promise<T> => {
  try {
    return (await request()).data;
  } catch (error) {
    throw toApiError(error);
  }
};

export const fetchDepartments = async (
  params: DepartmentListParams = {}
): Promise<DepartmentPage> => {
  const body = await call(() =>
    apiClient.get<Envelope<DepartmentListDto>>(DEPARTMENTS, { params: toQuery(params) })
  );
  const list = body.data ?? {};
  return {
    items: (list.results ?? []).map(toDepartment),
    page: list.page ?? 1,
    totalPages: list.totalPages ?? 0,
    totalResults: list.totalResults ?? 0,
  };
};

export const createDepartment = async (input: DepartmentInput): Promise<Department> => {
  const body = await call(() => apiClient.post<Envelope<DepartmentDto>>(DEPARTMENTS, input));
  return toDepartment(body.data);
};

export const updateDepartment = async (
  id: string,
  input: Partial<DepartmentInput>
): Promise<Department> => {
  const body = await call(() =>
    apiClient.put<Envelope<DepartmentDto>>(`${DEPARTMENTS}/${id}`, input)
  );
  return toDepartment(body.data);
};

export const deleteDepartment = async (id: string): Promise<void> => {
  await call(() => apiClient.delete(`${DEPARTMENTS}/${id}`));
};
