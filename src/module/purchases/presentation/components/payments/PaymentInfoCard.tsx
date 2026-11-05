import { Anchor, Text } from '@mantine/core';
import { IconClipboardText } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PaymentVoucher } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatDay } from '@/module/purchases/presentation/components/shared/format';
import { useOrder } from '@/module/purchases/presentation/hooks/usePurchaseQueries';
import { routes } from '@/router/routes';

/** Who is paid, when, how, and the reference that ties it to the bank. */
export const PaymentInfoCard = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const order = useOrder(doc.purchaseOrderId ?? undefined);

  return (
    <SectionCard icon={IconClipboardText} title={t('payments.detail.infoTitle')}>
      <InfoGrid
        items={[
          { label: t('payments.detail.vendor'), value: doc.vendor.name },
          { label: t('payments.detail.date'), value: formatDay(doc.date, currentLanguage) },
          {
            label: t('payments.detail.method'),
            value: doc.paymentMethod ? (
              <>
                {doc.paymentMethod.name}
                {doc.paymentMethod.accountName && (
                  <Text size="xs" c="dimmed">
                    {doc.paymentMethod.accountName}
                  </Text>
                )}
              </>
            ) : (
              ''
            ),
          },
          { label: t('payments.detail.reference'), value: doc.referenceNumber },
          ...(doc.purchaseOrderId
            ? [
                {
                  label: t('payments.detail.purchaseOrder'),
                  value: (
                    <Anchor
                      component={Link}
                      to={routes.purchases.orderDetail.replace(':id', doc.purchaseOrderId)}
                      size="sm"
                      fw={500}
                    >
                      {order.data?.number ?? t('journey.order')}
                    </Anchor>
                  ),
                },
              ]
            : []),
          ...(doc.paidAt
            ? [
                {
                  label: t('payments.detail.paidAt'),
                  value: formatDay(doc.paidAt.slice(0, 10), currentLanguage),
                },
              ]
            : []),
          ...(doc.memo ? [{ label: t('common.memo'), value: doc.memo, span: 2 as const }] : []),
        ]}
      />
      {doc.journalId && (
        <Text size="xs" c="dimmed">
          {t('payments.detail.journal')}
        </Text>
      )}
    </SectionCard>
  );
};
