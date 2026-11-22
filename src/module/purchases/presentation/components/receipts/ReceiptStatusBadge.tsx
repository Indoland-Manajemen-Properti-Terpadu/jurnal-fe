import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { GoodsReceipt } from '@/module/purchases/domain/purchaseDocuments';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';

/**
 * A confirmed receipt reads as billed or not yet billed, which is what the person looks for; every other
 * status (waiting for approval, rejected, voided) keeps the service's own wording.
 */
export const ReceiptStatusBadge = ({ receipt }: Readonly<{ receipt: GoodsReceipt }>) => {
  const { t } = useTranslation('purchases');
  if (receipt.status !== 'POSTED') {
    return <StatusBadge status={receipt.status} label={receipt.statusLabel} />;
  }
  const billed = receipt.billRefs.length > 0;
  return (
    <Badge variant="light" radius="sm" size="sm" color={billed ? 'green' : 'orange'}>
      {t(billed ? 'hub.receipts.isBilled' : 'hub.receipts.notBilled')}
    </Badge>
  );
};
