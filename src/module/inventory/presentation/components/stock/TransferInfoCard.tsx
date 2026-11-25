import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { StockTransfer } from '@/module/inventory/domain/stockTransfer';
import { InfoGrid } from '@/module/inventory/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { TransferWarehouseLink } from '@/module/inventory/presentation/components/stock/TransferWarehouseLink';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  transfer: StockTransfer;
  fromName: string;
  toName: string;
  /** Shown under the product count; undefined when the person is not sent values. */
  totalValue: number | undefined;
};

const time = (value: string | null) => (value ? dateFormatV1(value, 'D MMM YYYY, HH:mm') : '-');

/** The facts of a transfer: where, how many, who made it, who decided it and when. */
export function TransferInfoCard({ transfer, fromName, toName, totalValue }: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const { from, to, status } = transfer;
  // A deleted warehouse keeps its name but has no page to open.
  const link = (warehouse: StockTransfer['from'], name: string) => (
    <TransferWarehouseLink warehouseId={warehouse.deleted ? '' : warehouse.id} name={name} />
  );
  const decided = Boolean(transfer.approvedAt) || Boolean(transfer.approvedByName);

  return (
    <SectionCard
      icon={IconInfoCircle}
      title={t('detail.infoTitle')}
      subtitle={t('detail.infoSubtitle')}
      flush
    >
      <InfoGrid
        items={[
          { label: t('detail.from'), value: link(from, fromName), sub: from.code },
          { label: t('detail.to'), value: link(to, toName), sub: to.code },
          {
            label: t('detail.productCount'),
            value: t('detail.productCountValue', { count: transfer.productCount }),
            sub: totalValue === undefined ? undefined : formatCurrency(totalValue),
          },
          { label: t('detail.created'), value: time(transfer.createdAt || null) },
          ...(transfer.createdByName
            ? [{ label: t('detail.createdBy'), value: transfer.createdByName }]
            : []),
          ...(decided
            ? [
                { label: t('detail.approvedBy'), value: transfer.approvedByName ?? '-' },
                { label: t('detail.approvedAt'), value: time(transfer.approvedAt) },
              ]
            : []),
          ...(status === 'rejected'
            ? [
                { label: t('detail.rejectedBy'), value: transfer.rejectedByName ?? '-' },
                ...(transfer.rejectReason
                  ? [{ label: t('detail.rejectReason'), value: transfer.rejectReason }]
                  : []),
              ]
            : []),
          ...(status === 'void'
            ? [
                { label: t('detail.voided'), value: time(transfer.voidedAt) },
                ...(transfer.voidedByName
                  ? [{ label: t('detail.voidedBy'), value: transfer.voidedByName }]
                  : []),
                { label: t('detail.voidReason'), value: transfer.voidReason ?? '-' },
              ]
            : []),
          {
            label: t('detail.memo'),
            value: transfer.memo || '-',
            muted: !transfer.memo,
            full: true,
          },
        ]}
      />
    </SectionCard>
  );
}
