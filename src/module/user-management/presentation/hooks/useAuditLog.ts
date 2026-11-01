import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { AuditFilters, AuditList } from '@/module/user-management/domain/auditLog';
import { fetchAuditLog } from '@/module/user-management/infrastructure/auditApi';
import { retryTransient } from './queryRetry';
import { userManagementKeys } from './userManagementKeys';

export const AUDIT_PAGE_SIZE = 20;

export const useAuditLog = (page: number, filters: AuditFilters) =>
  useQuery<AuditList, Error>({
    queryKey: userManagementKeys.audit(page, filters),
    queryFn: () => fetchAuditLog(page, AUDIT_PAGE_SIZE, filters),
    retry: retryTransient,
    placeholderData: keepPreviousData,
  });
