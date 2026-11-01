import { useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
  filterSalesByStatus,
  type TransactionStatusFilter,
} from '@/module/contacts/domain/contactTransactions';
import { useContactTransactions } from './useContactQueries';

export type { TransactionStatusFilter };

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

  const filtered = useMemo(() => filterSalesByStatus(loaded, status), [loaded, status]);

  return {
    query,
    filteredCount: filtered.length,
    totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    items: filtered.slice((page - 1) * limit, page * limit),
    isLimited: (query.data?.pagination?.total ?? 0) > loaded.length,
  };
}
