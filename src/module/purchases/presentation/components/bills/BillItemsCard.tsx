import { Table, Text } from '@mantine/core';
import { IconListDetails } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import {
  formatAmount,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

const numeric = { whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' } as const;

/** The billed lines with the figures the server calculated. Discount and returns show only when used. */
export const BillItemsCard = ({ bill }: Readonly<{ bill: PurchaseBill }>) => {
  const { t } = useTranslation('purchases');
  const hasDiscount = bill.items.some((item) => item.discountAmount > 0);
  const hasReturns = bill.items.some((item) => item.returnedQty > 0);
  const columns = [
    'item',
    'quantity',
    'unitPrice',
    ...(hasDiscount ? ['discount'] : []),
    'amount',
    ...(hasReturns ? ['returned'] : []),
  ];

  return (
    <SectionCard icon={IconListDetails} title={t('bills.detail.itemsTitle')}>
      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" horizontalSpacing="sm">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              {columns.map((key) => (
                <Table.Th key={key} ta={key === 'item' ? undefined : 'right'}>
                  <Text
                    size="xs"
                    fw={700}
                    c="dimmed"
                    tt="uppercase"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    {t(`bills.detail.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bill.items.map((item) => (
              <Table.Tr key={item.id}>
                <Table.Td miw={160}>
                  <Text size="sm" fw={500}>
                    {item.product?.name || item.description || '-'}
                  </Text>
                  {item.tax && (
                    <Text size="xs" c="dimmed">
                      {item.tax.name}
                    </Text>
                  )}
                </Table.Td>
                <Table.Td ta="right" style={numeric}>
                  <Text size="sm">
                    {formatQuantity(item.quantity)} {item.unitName}
                  </Text>
                </Table.Td>
                <Table.Td ta="right" style={numeric}>
                  <Text size="sm">{formatAmount(item.unitPrice)}</Text>
                </Table.Td>
                {hasDiscount && (
                  <Table.Td ta="right" style={numeric}>
                    <Text size="sm" c={item.discountAmount ? undefined : 'dimmed'}>
                      {item.discountAmount ? formatAmount(item.discountAmount) : '-'}
                    </Text>
                  </Table.Td>
                )}
                <Table.Td ta="right" style={numeric}>
                  <Text size="sm" fw={500}>
                    {formatAmount(item.amount)}
                  </Text>
                </Table.Td>
                {hasReturns && (
                  <Table.Td ta="right" style={numeric}>
                    <Text size="sm" c={item.returnedQty ? undefined : 'dimmed'}>
                      {item.returnedQty ? formatQuantity(item.returnedQty) : '-'}
                    </Text>
                  </Table.Td>
                )}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </SectionCard>
  );
};
