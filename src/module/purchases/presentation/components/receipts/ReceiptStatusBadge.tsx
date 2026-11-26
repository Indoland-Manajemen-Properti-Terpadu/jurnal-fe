import type { GoodsReceipt } from '@/module/purchases/domain/purchaseDocuments';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';

/** The service's display status distinguishes billing progress from the receipt's POSTED state. */
export const ReceiptStatusBadge = ({ receipt }: Readonly<{ receipt: GoodsReceipt }>) => {
  return <StatusBadge status={receipt.displayStatus} label={receipt.statusLabel || undefined} />;
};
