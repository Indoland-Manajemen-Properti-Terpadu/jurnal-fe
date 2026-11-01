import apiClient from '@/lib/http/apiClient';
import { API_RBAC_AUDIT } from '@/lib/http/endpoints';
import type { AuditFilters, AuditList } from '@/module/user-management/domain/auditLog';
import type { AuditEntryDto, PaginatedDto } from './dto';
import { toAuditList } from './mappers';

export const fetchAuditLog = async (
  page: number,
  limit: number,
  filters: AuditFilters = {}
): Promise<AuditList> => {
  const response = await apiClient.get<PaginatedDto<AuditEntryDto>>(API_RBAC_AUDIT.GET_LOGS, {
    params: { page, limit, sortBy: 'createdAt:desc', ...filters },
  });
  return toAuditList(response.data);
};
