import { useMemo } from 'react';
import { useDebouncedValue } from '@mantine/hooks';
import {
  estimateBill,
  type BillEstimate,
  type BillQuantities,
  type BillSourceDoc,
} from '@/module/purchases/domain/billSources';
import { toBillInput, type BillFormValues } from '@/module/purchases/domain/billForm';
import type { BillSource } from '@/module/purchases/domain/purchaseDocuments';
import type { BillPreview } from '@/module/purchases/infrastructure/purchaseApi';
import { useBillPreview } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

const TYPING_DELAY_MS = 400;

export interface BillPricing {
  /** The local figures, always there; the screen's answer until the service's arrives. */
  estimate: BillEstimate;
  /** The service's own figures for what is picked, once it has answered. */
  preview: BillPreview | undefined;
  /** At least one line is billed for more than nothing. */
  hasQuantity: boolean;
}

/** Prices the bill being filled in: the local estimate at once, the service's numbers a moment later. */
export const useBillPricing = (
  source: BillSource,
  values: BillFormValues,
  picked: BillSourceDoc[],
  quantities: BillQuantities
): BillPricing => {
  const estimate = useMemo(() => estimateBill(picked, quantities), [picked, quantities]);
  const hasQuantity = estimate.rows.some((row) => row.qty > 0);
  const input = useMemo(
    () =>
      source === 'MANUAL' || picked.length === 0 || !hasQuantity || !values.date
        ? null
        : toBillInput(source, values, picked, false, quantities),
    [source, values, picked, quantities, hasQuantity]
  );
  const [settled] = useDebouncedValue(input, TYPING_DELAY_MS);
  const preview = useBillPreview(settled);
  return { estimate, preview: input ? preview.data : undefined, hasQuantity };
};
