import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDebouncedValue } from '@mantine/hooks';
import type { PaymentTermAppliesTo } from '@/module/settings/domain/paymentTerm';
import type { PaymentTermListParams } from '@/module/settings/infrastructure/paymentTermApi';

export const APPLIES_TO_FILTERS: readonly PaymentTermAppliesTo[] = ['goods', 'service', 'both'];
export type PaymentTermStatusFilter = 'active' | 'inactive';
export const STATUS_FILTERS: readonly PaymentTermStatusFilter[] = ['active', 'inactive'];

const SEARCH_DELAY_MS = 300;

const toPositiveInt = (value: string | null): number => {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : 1;
};

/**
 * Search, "Untuk" filter, status filter and page of the term list, kept in the address so they
 * survive a visit to the edit page and a refresh. The API is asked after the person stops typing.
 */
export const usePaymentTermListParams = () => {
  const [params, setParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState(params.get('q') ?? '');
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS);

  const update = useCallback(
    (changes: Record<string, string | null>) => {
      setParams(
        (current) => {
          const next = new URLSearchParams(current);
          Object.entries(changes).forEach(([key, value]) => {
            if (value) {
              next.set(key, value);
            } else {
              next.delete(key);
            }
          });
          return next;
        },
        { replace: true }
      );
    },
    [setParams]
  );

  const rawAppliesTo = params.get('appliesTo') as PaymentTermAppliesTo | null;
  const appliesTo =
    rawAppliesTo && APPLIES_TO_FILTERS.includes(rawAppliesTo) ? rawAppliesTo : undefined;
  const rawStatus = params.get('status') as PaymentTermStatusFilter | null;
  const status = rawStatus && STATUS_FILTERS.includes(rawStatus) ? rawStatus : undefined;
  const page = toPositiveInt(params.get('page'));

  const listParams: PaymentTermListParams = {
    q: search || undefined,
    appliesTo,
    isActive: status === undefined ? undefined : status === 'active',
    page,
  };

  return {
    listParams,
    searchInput,
    appliesTo,
    status,
    page,
    hasFilters: Boolean(searchInput.trim() || appliesTo || status),
    setSearchInput: (value: string) => {
      setSearchInput(value);
      update({ q: value.trim() ? value : null, page: null });
    },
    setAppliesTo: (value: string | null) =>
      update({
        appliesTo: APPLIES_TO_FILTERS.includes(value as PaymentTermAppliesTo) ? value : null,
        page: null,
      }),
    setStatus: (value: string | null) =>
      update({
        status: STATUS_FILTERS.includes(value as PaymentTermStatusFilter) ? value : null,
        page: null,
      }),
    setPage: (next: number) => update({ page: next > 1 ? String(next) : null }),
    reset: () => {
      setSearchInput('');
      setParams({}, { replace: true });
    },
  };
};
