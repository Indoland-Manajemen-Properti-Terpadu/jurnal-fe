import { Anchor, Box, Table, Text } from '@mantine/core';
import { IconReceipt2 } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { PurchaseBill } from '@/module/purchases/domain/purchaseDocuments';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { formatAmount, formatDay } from '@/module/purchases/presentation/components/shared/format';
import { routes } from '@/router/routes';

interface BillsTableCardProps {
  title: string;
  subtitle: string;
  bills: PurchaseBill[];
  emptyText: string;
}

/** "Faktur pembelian" of an order or a receipt, as in the reference web: number, due date, status, balance. */
export const BillsTableCard = ({
  title,
  subtitle,
  bills,
  emptyText,
}: Readonly<BillsTableCardProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  return (
    <SectionCard
      icon={IconReceipt2}
      flush
      title={title}
      subtitle={subtitle}
      count={t('orders.detail.billsCount', { count: bills.length })}
    >
      {bills.length === 0 ? (
        <Box px="lg" py="md">
          <Text size="sm" c="dimmed">
            {emptyText}
          </Text>
        </Box>
      ) : (
        <Table.ScrollContainer type="native" minWidth={520}>
          <Table className={tableClasses.table} verticalSpacing="sm" horizontalSpacing="lg">
            <Table.Thead bg="var(--jurnal-color-surface-muted)">
              <Table.Tr>
                {(['number', 'due', 'status', 'remaining'] as const).map((key) => (
                  <Table.Th key={key} ta={key === 'remaining' ? 'right' : undefined}>
                    <Text size="xs" fw={700} c="dark.7" tt="uppercase">
                      {t(`bills.detail.relatedCol.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {bills.map((bill) => (
                <Table.Tr key={bill.id}>
                  <Table.Td>
                    <Anchor
                      component={Link}
                      to={routes.purchases.billDetail.replace(':id', bill.id)}
                      size="sm"
                      fw={700}
                    >
                      {bill.number}
                    </Anchor>
                    {bill.vendorInvoiceNumber && (
                      <Text size="xs" c="dimmed">
                        {bill.vendorInvoiceNumber}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{formatDay(bill.dueDate, currentLanguage)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge
                      status={bill.status}
                      label={bill.displayStatusLabel || bill.statusLabel}
                    />
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={600} c={bill.remainingAmount > 0 ? 'red.7' : 'green.7'}>
                      {formatAmount(bill.remainingAmount)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      )}
    </SectionCard>
  );
};
