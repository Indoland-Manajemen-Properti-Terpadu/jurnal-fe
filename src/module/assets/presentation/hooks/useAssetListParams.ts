import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AssetStatus } from '@/module/assets/domain/asset';
import { ASSET_SORT_OPTIONS, DEFAULT_ASSET_SORT, resolveAssetSort } from './assetSortOptions';

const DEFAULT_LIMIT = 10;
const STATUSES: readonly AssetStatus[] = ['pending', 'active', 'fully_depreciated', 'disposed'];

const toPositiveInt = (value: string | null, fallback: number): number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : fallback;
};

/**
 * Status, search, sort and page of the asset list, kept in the URL so they survive a visit
 * to an asset's detail page and a refresh. Writes replace the history entry.
 */
export const useAssetListParams = () => {
  const [params, setParams] = useSearchParams();
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

  const rawStatus = params.get('status') as AssetStatus | null;
  const status = rawStatus && STATUSES.includes(rawStatus) ? rawStatus : undefined;
  const sort = resolveAssetSort(params.get('sort'));

  return {
    searchInput,
    search: params.get('search') ?? '',
    status,
    sort: sort.value,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    page: toPositiveInt(params.get('page'), 1),
    limit: toPositiveInt(params.get('limit'), DEFAULT_LIMIT),
    hasFilters: Boolean(status || params.get('search')),
    setSearchInput: (value: string) => {
      setSearchInput(value);
      update({ search: value.trim() ? value : null, page: null });
    },
    setStatus: (value: AssetStatus | undefined) => update({ status: value ?? null, page: null }),
    setSort: (value: string) =>
      update({
        sort:
          ASSET_SORT_OPTIONS.some((o) => o.value === value) && value !== DEFAULT_ASSET_SORT
            ? value
            : null,
        page: null,
      }),
    setPage: (page: number) => update({ page: page > 1 ? String(page) : null }),
    reset: () => {
      setSearchInput('');
      setParams({}, { replace: true });
    },
  };
};
