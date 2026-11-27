import type { BillSource } from '@/module/purchases/domain/purchaseDocuments';
import { compareInvoiceTotal } from '@/module/purchases/domain/purchasePriceChanges';

export interface BillPriceChangeGateInput {
  source: BillSource;
  orderIds: string[];
  vendorInvoiceTotal: number | '';
  previewTotal?: number | null;
  previewPrecision?: number | null;
  previewReady: boolean;
  priceChangePending: boolean;
}

export interface BillPriceChangeGate {
  comparison: boolean | null;
  comparisonUnknown: boolean;
  priceChangePending: boolean;
  splitOrders: boolean;
  canSave: boolean;
  canRequest: boolean;
}

/** Keeps a PO/SPK bill behind a fresh server preview and its price-change decision. */
export const billPriceChangeGate = ({
  source,
  orderIds,
  vendorInvoiceTotal,
  previewTotal,
  previewPrecision,
  previewReady,
  priceChangePending,
}: BillPriceChangeGateInput): BillPriceChangeGate => {
  if (source === 'MANUAL') {
    return {
      comparison: null,
      comparisonUnknown: false,
      priceChangePending: false,
      splitOrders: false,
      canSave: true,
      canRequest: false,
    };
  }

  const uniqueOrderIds = [...new Set(orderIds.filter(Boolean))];
  const comparison =
    previewTotal === undefined ||
    previewTotal === null ||
    previewPrecision === undefined ||
    previewPrecision === null
      ? null
      : compareInvoiceTotal(vendorInvoiceTotal, previewTotal, previewPrecision);
  const comparisonUnknown = vendorInvoiceTotal !== '' && comparison === null;
  const splitOrders = comparison === false && uniqueOrderIds.length > 1;
  const canProceed =
    previewReady && !priceChangePending && uniqueOrderIds.length > 0 && !comparisonUnknown;

  return {
    comparison,
    comparisonUnknown,
    priceChangePending,
    splitOrders,
    canSave: canProceed && comparison !== false,
    canRequest: canProceed && comparison === false && uniqueOrderIds.length === 1,
  };
};
