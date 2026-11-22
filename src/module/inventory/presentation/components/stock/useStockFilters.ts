import { useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';
import {
  applyFilterPatch,
  readFilters,
  type StockFilterValues,
} from '@/module/inventory/presentation/components/stock/stockFilters';

/** The tab and filters of Stock Movements, kept in the address so a link opens the same view. */
export const useStockFilters = () => {
  const [params, setParams] = useSearchParams();
  const today = dayjs().format('YYYY-MM-DD');
  const values = useMemo(() => readFilters(params, today), [params, today]);
  const update = useCallback(
    (patch: Partial<StockFilterValues>) =>
      setParams((current) => applyFilterPatch(current, patch), { replace: true }),
    [setParams]
  );
  return { values, update, today };
};
