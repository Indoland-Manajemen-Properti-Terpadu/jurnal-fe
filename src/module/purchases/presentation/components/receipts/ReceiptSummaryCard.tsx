import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Anchor, Table, Text } from '@mantine/core';
import { IconClipboardText, IconListDetails } from '@tabler/icons-react';
import { Link, generatePath } from 'react-router-dom';
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
}

/** Who delivered what, when, against which order, and the value recognised for it. */
export const ReceiptSummaryCard = ({ receipt }: Readonly<ReceiptSummaryCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const total = receipt.amount || receipt.items.reduce((sum, item) => sum + item.accrualAmount, 0);
  const service = receipt.kind === 'SERVICE';

  return (
    <>
      <SectionCard
        icon={IconClipboardText}
        label
        flush
        title={t('receipts.detail.infoTitle', { label: receipt.documentLabel })}
        subtitle={t('receipts.detail.infoSubtitle')}
      >
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
                  fw={700}
                >
                  {receipt.purchaseOrderNumber || t('receipts.detail.viewOrder')}
                </Anchor>
              ),
            },
            {
              label: t('receipts.detail.receivedOn'),
              value: formatDay(receipt.date, currentLanguage),
            },
            ...(service
              ? []
              : [{ label: t('receipts.form.warehouse'), value: receipt.warehouse?.name ?? '' }]),
            { label: t('receipts.form.deliveryNote'), value: receipt.deliveryNote },
            {
              label: t('receipts.detail.bills'),
              value:
                receipt.billRefs.length > 0
                  ? receipt.billRefs.map((bill) => bill.number).join(', ')
                  : '',
            },
            ...(receipt.journalId
              ? [
                  {
                    label: t('receipts.detail.journalLabel'),
                    value: (
                      <Anchor
                        component={Link}
                        to={generatePath(routes.journalEntries.detail, {
                          idTransaction: receipt.journalId,
                        })}
                        size="sm"
                        fw={700}
                      >
                        {t('receipts.detail.viewJournal')}
                      </Anchor>
                    ),
                    sub: t('receipts.detail.journalNote'),
                  },
                ]
              : []),
            ...(receipt.memo
              ? [
                  {
                    label: t('common.memo'),
                    value: receipt.memo,
                    // Beside the journal it fills the row; alone it takes the whole row.
                    span: receipt.journalId ? undefined : (2 as const),
                  },
                ]
              : []),
          ]}
        />
      </SectionCard>

      <SectionCard
        icon={IconListDetails}
        flush
        title={t('receipts.detail.linesTitle')}
        subtitle={t('receipts.detail.linesSubtitle')}
        count={t('receipts.detail.itemsCount', { count: receipt.items.length })}
      >
        <Table.ScrollContainer type="native" minWidth={520}>
          <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                {['item', 'quantity', ...(service ? [] : ['rejected']), 'accrual'].map((key) => (
                  <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                    <Text size="xs" fw={700} c="dark.7">
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
                    <Text size="sm" fw={700}>
                      {item.product?.name || item.description || '-'}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right" style={numeric}>
                    <Text size="sm">
                      {formatQuantity(item.receivedQty)} {item.product?.unitName}
                    </Text>
                  </Table.Td>
                  {!service && (
                    <Table.Td ta="right" style={numeric}>
                      <Text size="sm" c={item.rejectedQty > 0 ? undefined : 'dimmed'}>
                        {formatQuantity(item.rejectedQty)}
                      </Text>
                    </Table.Td>
                  )}
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
                <Table.Td colSpan={service ? 2 : 3}>
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
