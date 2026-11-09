import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const DEFAULT_LIMIT = 10;

const toPositiveInt = (value: string | null, fallback: number): number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

/**
 * Search, page and page size of the product list, kept in the URL so they survive a
 * visit to a product's detail page (and a refresh). Writes replace the history entry,
 * so typing does not pile up Back steps.
 */
export const useProductListParams = () => {
  const [params, setParams] = useSearchParams();
  // The box shows what the user types; the URL is only written when the value changes.
  const [searchInput, setSearchInput] = useState(params.get('search') ?? '');

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            if (value) next.set(key, value);
            else next.delete(key);
          });
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  return {
    searchInput,
    search: params.get('search') ?? '',
    page: toPositiveInt(params.get('page'), 1),
    limit: toPositiveInt(params.get('limit'), DEFAULT_LIMIT),
    setSearchInput: (value: string) => {
      setSearchInput(value);
      update({ search: value.trim() ? value : null, page: null });
    },
    setPage: (page: number) => update({ page: page > 1 ? String(page) : null }),
    setLimit: (limit: number) =>
      update({ limit: limit === DEFAULT_LIMIT ? null : String(limit), page: null }),
  };
};
