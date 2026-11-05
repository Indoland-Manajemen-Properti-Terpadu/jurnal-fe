import { Stack } from '@mantine/core';
import { IconArrowsSplit } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseReturn } from '@/module/purchases/domain/purchaseDocuments';
import {
  MoneyRows,
  type MoneyRow,
} from '@/module/purchases/presentation/components/shared/MoneyRows';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { SegmentBar } from '@/module/purchases/presentation/components/shared/visuals';

/** Where the value of a posted return went: the bill's balance, or vendor credit. */
export const ReturnSettlementCard = ({ doc }: Readonly<{ doc: PurchaseReturn }>) => {
  const { t } = useTranslation('purchases');
  const credit = Math.round((doc.finalAmount - doc.appliedToBill) * 100) / 100;
  const rows: MoneyRow[] = [
    { label: t('returns.detail.appliedToBill'), amount: formatAmount(doc.appliedToBill) },
    ...(credit > 0
      ? [
          { label: t('returns.detail.creditCreated'), amount: formatAmount(credit) },
          ...(doc.creditUsed > 0
            ? [{ label: t('returns.detail.creditUsed'), amount: formatAmount(doc.creditUsed) }]
            : []),
          {
            label: t('returns.detail.creditRemaining'),
            amount: formatAmount(doc.creditRemaining),
            emphasis: 'total' as const,
          },
        ]
      : []),
  ];
  return (
    <SectionCard
      icon={IconArrowsSplit}
      title={t('returns.detail.settlementTitle')}
      subtitle={t('returns.detail.settlementSubtitle')}
    >
      <Stack gap="md">
        <SegmentBar
          height={12}
          aria-label={t('returns.detail.settlementTitle')}
          segments={[
            { key: 'bill', value: doc.appliedToBill, color: 'var(--mantine-color-primary-6)' },
            { key: 'credit', value: credit, color: 'var(--mantine-color-primary-3)' },
          ]}
        />
        <MoneyRows rows={rows} />
      </Stack>
    </SectionCard>
  );
};
