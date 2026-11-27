import { useState } from 'react';
import { billPriceChangeGate } from '@/module/purchases/domain/billPriceChangeGate';
import {
  openPriceChangeItems,
  type PriceChangeInput,
  type PriceChangeRequest,
} from '@/module/purchases/domain/purchasePriceChanges';
import type { BillFormValues } from '@/module/purchases/domain/billForm';
import type { BillSource } from '@/module/purchases/domain/purchaseDocuments';
import type { BillPreview } from '@/module/purchases/infrastructure/purchaseBillPreview';
import type { BillSourceDoc } from '@/module/purchases/domain/billSources';
import { useCreatePriceChange } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useOrder } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillPreviewState {
  preview?: BillPreview;
  previewReady: boolean;
  previewLoading: boolean;
  previewError: boolean;
  refetch: () => Promise<{ data: BillPreview | undefined }>;
}

export const useBillPriceChange = (
  source: BillSource,
  values: BillFormValues,
  picked: BillSourceDoc[],
  pricing: BillPreviewState
) => {
  const orderIds = [...new Set(picked.map((doc) => doc.orderId || doc.id).filter(Boolean))];
  const orderId = orderIds.length === 1 ? orderIds[0] : undefined;
  const order = useOrder(orderId);
  const mutation = useCreatePriceChange();
  const [dialogOpened, setDialogOpened] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<PriceChangeRequest | null>(null);
  const priceChangePending =
    Boolean(pricing.preview?.priceChangePending) ||
    Boolean(pricing.preview?.pendingPriceChange) ||
    order.data?.pendingPriceChange?.status === 'PENDING_APPROVAL' ||
    submittedRequest?.status === 'PENDING_APPROVAL';
  const gate = billPriceChangeGate({
    source,
    orderIds,
    vendorInvoiceTotal: values.vendorInvoiceTotal,
    previewTotal: pricing.preview?.total,
    previewPrecision: pricing.preview?.precision,
    previewReady: pricing.previewReady,
    priceChangePending,
  });
  const orderNumber =
    order.data?.number ?? picked.find((doc) => doc.orderNumber)?.orderNumber ?? '';
  const pendingRequest = order.data?.pendingPriceChange ?? submittedRequest;
  const requestDisabled =
    mutation.isPending ||
    order.isLoading ||
    order.isError ||
    !order.data ||
    openPriceChangeItems(order.data.items).length === 0;

  const submit = async (input: PriceChangeInput) => {
    if (!orderId) return;
    const request = await mutation.mutateAsync({ orderId, input });
    setSubmittedRequest(request);
    setDialogOpened(false);
  };

  const refreshStatus = async () => {
    const results = await Promise.all([pricing.refetch(), order.refetch()]);
    const nextPreview = results[0].data;
    const nextOrder = results[1].data;
    if (
      !nextPreview?.priceChangePending &&
      !nextPreview?.pendingPriceChange &&
      !nextOrder?.pendingPriceChange
    ) {
      setSubmittedRequest(null);
    }
  };

  return {
    gate,
    order,
    orderId,
    orderNumber,
    pendingRequest,
    priceChangePending,
    dialogOpened,
    setDialogOpened,
    mutation,
    requestDisabled,
    submit,
    refreshStatus,
  };
};
