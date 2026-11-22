import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

/** Search, status filter and page of one list; changing a filter returns to the first page. */
export const useListState = (initialStatus = '') => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 350);
  const [status, setStatusValue] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [limit, setLimitValue] = useState(10);

  return {
    searchInput,
    setSearch: (value: string) => {
      setSearchInput(value);
      setPage(1);
    },
    status,
    setStatus: (value: string | null) => {
      setStatusValue(value ?? '');
      setPage(1);
    },
    page,
    setPage,
    limit,
    setLimit: (value: number) => {
      setLimitValue(value);
      setPage(1);
    },
    reset: () => {
      setSearchInput('');
      setStatusValue('');
      setPage(1);
    },
    isFiltered: Boolean(searchInput.trim() || status),
    /** Query params shared by every purchasing list. */
    params: {
      page,
      limit,
      search: debouncedSearch.trim(),
      status,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    },
  };
};
