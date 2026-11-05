import apiClient from '@/lib/http/apiClient';
import type { ReceivablesSummary, SaleStatusCounts } from '../domain/sale';
import type { ReceivablesSummaryDto, SaleStatusCountsDto } from './saleDto';
import { mapReceivablesSummary, mapStatusCounts } from './saleMapper';
import { SALE_ENDPOINTS } from './saleApi';

type ApiEnvelope<T> = { code: number; message: string; data: T };

export type ReceivablesRange = { startDate?: string; endDate?: string };
export type StatusCountFilters = ReceivablesRange & { search?: string };

/** Receivable figures over all invoices (not just the visible page); both dates are optional. */
export const fetchReceivablesSummary = async (
  range: ReceivablesRange = {}
): Promise<ReceivablesSummary> => {
  const { data } = await apiClient.get<ApiEnvelope<ReceivablesSummaryDto>>(
    SALE_ENDPOINTS.receivablesSummary,
    { params: { startDate: range.startDate || undefined, endDate: range.endDate || undefined } }
  );
  return mapReceivablesSummary(data.data);
};

/** How many invoices sit in each payment state, for the tab and filter counts. */
export const fetchSaleStatusCounts = async (
  filters: StatusCountFilters = {}
): Promise<SaleStatusCounts> => {
  const { data } = await apiClient.get<ApiEnvelope<SaleStatusCountsDto>>(
    SALE_ENDPOINTS.statusCounts,
    {
      params: {
        search: filters.search?.trim() || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      },
    }
  );
  return mapStatusCounts(data.data);
};
