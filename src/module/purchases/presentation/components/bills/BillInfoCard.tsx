import { Anchor, Group, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { isBillOverdue } from '@/module/purchases/domain/purchaseActions';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatAmount,
  formatDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface BillInfoCardProps {
  bill: PurchaseBill;
}

/** Vendor, invoice, dates and where the bill comes from. */
export const BillInfoCard = ({ bill }: Readonly<BillInfoCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const overdue = isBillOverdue(bill, todayIso());

  return (
    <SectionCard
      icon={IconClipboardText}
      label
      flush
      title={t('bills.detail.infoTitle')}
      subtitle={t('bills.detail.infoSubtitle')}
    >
      <InfoGrid
        items={[
          { label: t('common.vendor'), value: bill.vendor.name },
          {
            label: t('bills.detail.source'),
            value: t(`bills.form.source.${bill.source}`),
          },
          {
            label: t('bills.detail.documents'),
            value: (
              <Group gap={8}>
                {[
                  ...bill.goodsReceiptRefs.map((ref) => ({
                    ...ref,
                    to: routes.purchases.receiptDetail.replace(':id', ref.id),
                  })),
                  ...bill.purchaseOrderRefs.map((ref) => ({
                    ...ref,
                    to: routes.purchases.orderDetail.replace(':id', ref.id),
                  })),
                ].map((ref) => (
                  <Anchor key={ref.id} component={Link} to={ref.to} size="sm" fw={700}>
                    {ref.number}
                  </Anchor>
                ))}
                {bill.noMatch && (
                  <Text span size="sm" c="dimmed">
                    {t('bills.detail.noMatch')}
                  </Text>
                )}
              </Group>
            ),
          },
          { label: t('bills.detail.taxInvoiceNumber'), value: bill.taxInvoiceNumber },
          { label: t('orders.form.paymentTerm'), value: bill.paymentTermName ?? '' },
          { label: t('bills.detail.invoiceNumber'), value: bill.vendorInvoiceNumber },
          {
            label: t('bills.detail.invoiceTotal'),
            value: bill.vendorInvoiceTotal !== null ? formatAmount(bill.vendorInvoiceTotal) : '',
          },
          { label: t('bills.detail.billDate'), value: formatDay(bill.date, currentLanguage) },
          {
            label: t('bills.detail.dueDate'),
            value: (
              <Text span fz="md" fw={700} c={overdue ? 'red.7' : undefined}>
                {formatDay(bill.dueDate, currentLanguage)}
                {overdue && ` · ${t('bills.detail.overdue')}`}
              </Text>
            ),
          },
          ...(bill.journalId
            ? [{ label: t('bills.detail.journalLabel'), value: t('bills.detail.journalNote') }]
            : []),
          ...(bill.memo ? [{ label: t('common.memo'), value: bill.memo, span: 2 as const }] : []),
        ]}
      />
    </SectionCard>
  );
};
