import { useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import { useContactTransactions } from './useContactQueries';

export type TransactionStatusFilter = 'all' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'DRAFT';

export function useContactTransactionView(
  contactId: string | undefined,
  search: string,
  status: TransactionStatusFilter,
  page: number,
  limit: number
) {
  const [debouncedSearch] = useDebouncedValue(search, 400);
  const query = useContactTransactions(contactId, {
    page: 1,
    limit: 100,
    search: debouncedSearch.trim() || undefined,
  });
  const loaded = query.data?.items ?? [];

  const filtered = useMemo(() => {
    const now = Date.now();
    return loaded.filter((sale) => {
      const normalized = String(sale.status || 'DRAFT').toUpperCase();
      const overdue =
        (sale.remainingAmount ?? 0) > 0 &&
        Boolean(sale.dueDate) &&
        new Date(sale.dueDate!).getTime() < now;
      if (status === 'OVERDUE') return overdue;
      if (status === 'UNPAID') {
        return (
          normalized === 'UNPAID' ||
          normalized === 'OPEN' ||
          normalized === 'PARTIAL' ||
          ((sale.remainingAmount ?? 0) > 0 && normalized !== 'DRAFT')
        );
      }
      if (status === 'PAID') {
        return (
          normalized === 'PAID' || ((sale.remainingAmount ?? 0) <= 0 && (sale.paidAmount ?? 0) > 0)
        );
      }
      if (status === 'DRAFT') return normalized === 'DRAFT';
      return true;
    });
  }, [loaded, status]);

  return {
    query,
    filteredCount: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    items: filtered.slice((page - 1) * limit, page * limit),
    isLimited: (query.data?.pagination?.total ?? 0) > loaded.length,
  };
}
