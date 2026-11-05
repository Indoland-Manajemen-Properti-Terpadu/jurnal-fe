import { Stack, Text } from '@mantine/core';
import { IconCoins } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { isBillOverdue } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { Legend, SegmentBar } from '@/module/purchases/presentation/components/shared/visuals';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount, todayIso } from '@/module/purchases/presentation/components/shared/format';

const PAID = 'var(--mantine-color-primary-6)';
const OFFSET = 'var(--mantine-color-primary-3)';
const OPEN = 'var(--mantine-color-primary-1)';

/** How much of the bill is settled, by what, and what is still owed. */
export const BillSettlementCard = ({ bill }: Readonly<{ bill: PurchaseBill }>) => {
  const { t } = useTranslation('purchases');
  const offset = bill.returnedAmount + bill.creditAppliedAmount;
  const settled = bill.paidAmount + offset;
  const percent =
    bill.finalAmount > 0 ? Math.min(100, Math.round((settled / bill.finalAmount) * 100)) : 0;
  const late = isBillOverdue(bill, todayIso());

  return (
    <SectionCard icon={IconCoins} title={t('bills.detail.settlementTitle')}>
      <Stack gap="sm">
        <Text fz="var(--jurnal-text-2xl)" fw={700} lh={1.1}>
          {percent}%
          <Text span fz="xs" c="dimmed" fw={500} ml={6}>
            {t('bills.detail.settledShort')}
          </Text>
        </Text>
        <SegmentBar
          height={12}
          aria-label={t('bills.detail.settledPercent', { percent })}
          segments={[
            { key: 'paid', value: bill.paidAmount, color: PAID },
            { key: 'offset', value: offset, color: OFFSET },
            { key: 'open', value: bill.remainingAmount, color: OPEN },
          ]}
        />
        <Legend
          items={[
            {
              key: 'paid',
              label: t('bills.detail.paid'),
              value: formatAmount(bill.paidAmount),
              color: PAID,
            },
            ...(offset > 0
              ? [
                  {
                    key: 'offset',
                    label: t('bills.detail.offset'),
                    value: formatAmount(offset),
                    color: OFFSET,
                  },
                ]
              : []),
            {
              key: 'open',
              label: t('bills.detail.remaining'),
              value: formatAmount(bill.remainingAmount),
              color: late ? 'var(--mantine-color-red-5)' : OPEN,
            },
          ]}
        />
      </Stack>
    </SectionCard>
  );
};
