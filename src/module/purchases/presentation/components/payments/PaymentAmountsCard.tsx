import { IconCoins } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { cashOut } from '@/module/purchases/domain/paymentForm';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import {
  MoneyRows,
  type MoneyRow,
} from '@/module/purchases/presentation/components/shared/MoneyRows';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

/** What leaves the bank for this voucher: the payment plus the method's fee. */
export const PaymentAmountsCard = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t } = useTranslation('purchases');
  const rows: MoneyRow[] = [
    { label: t('payments.detail.total'), amount: formatAmount(doc.totalAmount) },
    ...(doc.adminFee > 0
      ? [{ label: t('payments.detail.fee'), amount: formatAmount(doc.adminFee) }]
      : []),
    {
      label: t('payments.detail.cashOut'),
      amount: formatAmount(cashOut(doc.totalAmount, doc.adminFee)),
      emphasis: 'total',
    },
    ...(doc.type === 'ADVANCE' && doc.advanceAppliedAmount > 0
      ? [
          {
            label: t('payments.detail.advanceApplied'),
            amount: formatAmount(doc.advanceAppliedAmount),
            emphasis: 'muted' as const,
          },
        ]
      : []),
  ];
  return (
    <SectionCard icon={IconCoins} title={t('payments.detail.amountsTitle')}>
      <MoneyRows rows={rows} />
    </SectionCard>
  );
};
