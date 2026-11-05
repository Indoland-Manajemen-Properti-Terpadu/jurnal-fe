import { useState } from 'react';
import { useDebouncedValue } from '@mantine/hooks';

export const PAGE_SIZE = 10;

/** Search, status filter and page of one list; changing a filter returns to the first page. */
export const useListState = (initialStatus = '') => {
  const [searchInput, setSearchInput] = useState('');
  const [debouncedSearch] = useDebouncedValue(searchInput, 350);
  const [status, setStatusValue] = useState(initialStatus);
  const [page, setPage] = useState(1);

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
    reset: () => {
      setSearchInput('');
      setStatusValue('');
      setPage(1);
    },
    isFiltered: Boolean(searchInput.trim() || status),
    /** Query params shared by every purchasing list. */
    params: {
      page,
      limit: PAGE_SIZE,
      search: debouncedSearch.trim(),
      status,
      sortBy: 'createdAt',
      sortOrder: 'desc' as const,
    },
  };
};
