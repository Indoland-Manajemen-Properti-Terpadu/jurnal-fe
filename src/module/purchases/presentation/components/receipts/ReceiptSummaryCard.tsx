import { Anchor, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { GoodsReceipt } from '@/module/purchases/domain/purchaseDocuments';
import { InfoGrid } from '@/module/purchases/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatAmount,
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

const numeric = { whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } as const;

interface ReceiptSummaryCardProps {
  receipt: GoodsReceipt;
  orderNumber: string | null;
}

/** Who delivered what, when, against which order, and the value recognised for it. */
export const ReceiptSummaryCard = ({ receipt, orderNumber }: Readonly<ReceiptSummaryCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const total = receipt.items.reduce((sum, item) => sum + item.accrualAmount, 0);

  return (
    <>
      <SectionCard icon={IconClipboardText} title={t('receipts.detail.infoTitle')}>
        <InfoGrid
          items={[
            { label: t('common.vendor'), value: receipt.vendor.name },
            {
              label: t('receipts.detail.order'),
              value: (
                <Anchor
                  component={Link}
                  to={routes.purchases.orderDetail.replace(':id', receipt.purchaseOrderId)}
                  size="sm"
                  fw={500}
                >
                  {orderNumber ?? t('receipts.detail.viewOrder')}
                </Anchor>
              ),
            },
            {
              label: t('receipts.detail.receivedOn'),
              value: formatDay(receipt.date, currentLanguage),
            },
            { label: t('receipts.form.deliveryNote'), value: receipt.deliveryNote },
            ...(receipt.memo
              ? [{ label: t('common.memo'), value: receipt.memo, span: 2 as const }]
              : []),
          ]}
        />
        {receipt.journalId && (
          <Text size="xs" c="dimmed">
            {t('receipts.detail.journalNote')}
          </Text>
        )}
      </SectionCard>

      <SectionCard icon={IconListDetails} title={t('receipts.detail.linesTitle')}>
        <Table.ScrollContainer minWidth={520}>
          <Table verticalSpacing="sm" horizontalSpacing="sm">
            <Table.Thead bg="var(--jurnal-color-surface-hover)">
              <Table.Tr>
                {['item', 'quantity', 'accrual'].map((key) => (
                  <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {t(`receipts.detail.col.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {receipt.items.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>
                    <Text size="sm" fw={500}>
                      {item.product?.name || item.description || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={numeric}>
                    <Text size="sm">
                      {formatQuantity(item.receivedQty)} {item.product?.unitName}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={numeric}>
                    <Text size="sm" fw={500}>
                      {formatAmount(item.accrualAmount)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            <Table.Tfoot>
              <Table.Tr>
                <Table.Td colSpan={2}>
                  <Text size="sm" fw={700}>
                    {t('receipts.detail.totalAccrual')}
                  </Text>
                </Table.Td>
                <Table.Td ta="right" style={numeric}>
                  <Text size="sm" fw={700}>
                    {formatAmount(total)}
                  </Text>
                </Table.Td>
              </Table.Tr>
            </Table.Tfoot>
          </Table>
        </Table.ScrollContainer>
      </SectionCard>
    </>
  );
};
