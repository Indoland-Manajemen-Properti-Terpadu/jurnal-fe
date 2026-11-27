import { Anchor, Group, Text } from '@mantine/core';
import { IconBuildingStore } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  paymentRequestAmountsVisible,
  type PaymentRequest,
} from '@/module/purchases/domain/paymentRequest';
import type { PurchaseStatus } from '@/module/purchases/domain/purchaseStatus';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import { routes } from '@/router/routes';

/** For a request with several vendors: what each is asked for and the voucher each one got. */
export const PaymentRequestVendorsCard = ({ doc }: Readonly<{ doc: PaymentRequest }>) => {
  const { t } = useTranslation('purchases');
  const showAmounts = paymentRequestAmountsVisible(doc.status, doc.approval);
  if (!doc.isMultiVendor) return null;
  return (
    <SectionCard
      icon={IconBuildingStore}
      flush
      title={t('paymentRequests.detail.vendorsTitle')}
      subtitle={t('paymentRequests.detail.vendorsSubtitle')}
      count={t('paymentRequests.detail.vendorsCount', { count: doc.vendorTotals.length })}
    >
      {doc.vendorTotals.map((total, index) => (
        <Group
          key={total.vendorId}
          justify="space-between"
          wrap="nowrap"
          px="lg"
          py="sm"
          style={
            index > 0 ? { borderTop: '1px solid var(--jurnal-color-border-subtle)' } : undefined
          }
        >
          <div style={{ minWidth: 0 }}>
            <Text size="sm" fw={700}>
              {total.vendorName}
            </Text>
            <Text size="xs" c="dimmed">
              {t('paymentRequests.detail.billCount', { count: total.billCount })}
            </Text>
          </div>
          <Group gap="md" wrap="nowrap">
            <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {showAmounts ? formatAmount(total.amount) : '—'}
            </Text>
            {total.voucher ? (
              <Group gap="xs" wrap="nowrap">
                <Anchor
                  component={Link}
                  to={routes.purchases.paymentDetail.replace(':id', total.voucher.id)}
                  size="sm"
                  fw={700}
                >
                  {total.voucher.number}
                </Anchor>
                <StatusBadge status={total.voucher.status as PurchaseStatus} />
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                {t('paymentRequests.detail.noVendorVoucher')}
              </Text>
            )}
          </Group>
        </Group>
      ))}
    </SectionCard>
  );
};
