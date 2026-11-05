import { List } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import type { BillVarianceFinding } from '@/module/purchases/presentation/components/bills/billExtras';
import { StatusNote } from '@/module/purchases/presentation/components/shared/StatusNote';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface BillVariancesCardProps {
  bill: PurchaseBill;
  findings: BillVarianceFinding[];
}

/** What the match against the order and the vendor's invoice found; verifying needs an explicit yes. */
export const BillVariancesCard = ({ bill, findings }: Readonly<BillVariancesCardProps>) => {
  const { t } = useTranslation('purchases');
  if (findings.length === 0) return null;
  const itemName = (id: string | null) => {
    const item = bill.items.find((candidate) => candidate.purchaseOrderItemId === id);
    return item?.product?.name || item?.description || '-';
  };

  return (
    <StatusNote tone="warning" title={t('bills.detail.variancesTitle')}>
      <List size="sm" spacing={4}>
        {findings.map((finding) => (
          <List.Item key={`${finding.type}-${finding.purchaseOrderItemId ?? 'total'}`}>
            {finding.type === 'PRICE'
              ? t('bills.detail.variancePrice', {
                  item: itemName(finding.purchaseOrderItemId),
                  expected: formatAmount(finding.expected),
                  actual: formatAmount(finding.actual),
                })
              : t('bills.detail.varianceTotal', {
                  expected: formatAmount(finding.expected),
                  actual: formatAmount(finding.actual),
                })}
          </List.Item>
        ))}
      </List>
    </StatusNote>
  );
};
