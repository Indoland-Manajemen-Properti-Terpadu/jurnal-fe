import { useState } from 'react';
import type {
  PeriodListParams,
  PeriodStatusFilter,
  PeriodType,
} from '@/module/period-closing/domain/accountingPeriod';

const PAGE_SIZE = 10;

/** Filters of the period list; changing a filter goes back to the first page. */
export const usePeriodListParams = () => {
  const [type, setTypeState] = useState<PeriodType | undefined>();
  const [status, setStatusState] = useState<PeriodStatusFilter | undefined>();
  const [page, setPage] = useState(1);

  const params: PeriodListParams = { type, status, page, limit: PAGE_SIZE };

  return {
    params,
    type,
    status,
    setPage,
    setType: (next: PeriodType | undefined) => {
      setTypeState(next);
      setPage(1);
    },
    setStatus: (next: PeriodStatusFilter | undefined) => {
      setStatusState(next);
      setPage(1);
    },
    hasFilters: Boolean(type || status),
    reset: () => {
      setTypeState(undefined);
      setStatusState(undefined);
      setPage(1);
    },
  };
};
