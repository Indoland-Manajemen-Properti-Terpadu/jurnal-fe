import apiClient from '@/lib/http/apiClient';
import type { BulkOutcome, BulkRecurringValues, BulkRow, BulkRowStatus } from '../domain/saleBulk';
import { toNumber } from './saleMapperUtils';

interface BulkRowDto {
  customer?: string;
  name?: string;
  status?: string;
  saleId?: string;
  transactionNumber?: string;
  message?: string;
}

interface BulkDto {
  data: {
    summary?: { created?: number; skipped?: number; failed?: number };
    results?: BulkRowDto[];
  };
}

const STATUSES: BulkRowStatus[] = ['created', 'skipped', 'failed'];

const mapRow = (row: BulkRowDto): BulkRow => ({
  customer: row.customer ?? '',
  name: row.name ?? '',
  status: STATUSES.includes(row.status as BulkRowStatus) ? (row.status as BulkRowStatus) : 'failed',
  saleId: row.saleId ?? null,
  transactionNumber: row.transactionNumber ?? null,
  message: row.message ?? '',
});

/** One draft invoice per customer; the answer is 201 with a result for each customer. */
export const createBulkRecurring = async (values: BulkRecurringValues): Promise<BulkOutcome> => {
  const { data } = await apiClient.post<BulkDto>('/v1/sales/bulk-recurring', {
    product: values.product,
    period: values.period,
    transactionDate: values.transactionDate,
    dueDate: values.dueDate,
    unitPrice: values.unitPrice,
    customers: values.customers,
  });
  const { summary, results } = data.data;
  return {
    created: toNumber(summary?.created),
    skipped: toNumber(summary?.skipped),
    failed: toNumber(summary?.failed),
    rows: (results ?? []).map(mapRow),
  };
};
