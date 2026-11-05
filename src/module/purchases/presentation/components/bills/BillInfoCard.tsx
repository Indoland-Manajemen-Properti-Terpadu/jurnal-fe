import { Anchor, Text } from '@mantine/core';
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
  orderNumber: string | null;
}

/** Vendor, invoice, dates and where the bill comes from. */
export const BillInfoCard = ({ bill, orderNumber }: Readonly<BillInfoCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const overdue = isBillOverdue(bill, todayIso());

  return (
    <SectionCard icon={IconClipboardText} title={t('bills.detail.infoTitle')}>
      <InfoGrid
        items={[
          { label: t('common.vendor'), value: bill.vendor.name },
          {
            label: t('bills.detail.order'),
            value: (
              <Anchor
                component={Link}
                to={routes.purchases.orderDetail.replace(':id', bill.purchaseOrderId)}
                size="sm"
                fw={500}
              >
                {orderNumber ?? t('bills.detail.viewOrder')}
              </Anchor>
            ),
          },
          { label: t('bills.detail.invoiceNumber'), value: bill.vendorInvoiceNumber },
          {
            label: t('bills.detail.invoiceTotal'),
            value: bill.vendorInvoiceTotal !== null ? formatAmount(bill.vendorInvoiceTotal) : '',
          },
          { label: t('bills.detail.billDate'), value: formatDay(bill.date, currentLanguage) },
          {
            label: t('bills.detail.dueDate'),
            value: (
              <Text span fz="sm" fw={500} c={overdue ? 'red.7' : undefined}>
                {formatDay(bill.dueDate, currentLanguage)}
                {overdue && ` · ${t('bills.detail.overdue')}`}
              </Text>
            ),
          },
          ...(bill.memo ? [{ label: t('common.memo'), value: bill.memo, span: 2 as const }] : []),
        ]}
      />
      {bill.journalId && (
        <Text fz="xs" c="dimmed">
          {t('bills.detail.journalNote')}
        </Text>
      )}
    </SectionCard>
  );
};
