import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Progress,
  Table,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  IconCalendar,
  IconCheck,
  IconDots,
  IconReceipt2,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState/EmptyState';
import { formatCurrency } from '@/utils/FormatCurrency';
import { PurchaseBill } from '@/module/purchases/domain/purchase';
import { paidPercent } from '@/module/purchases/domain/purchaseTotals';
import { useTranslation } from '@/i18n';

interface PurchaseTableProps {
  bills: PurchaseBill[];
  loading?: boolean;
  onPay: (bill: PurchaseBill) => void;
  onDelete: (bill: PurchaseBill) => void;
  onAddNew: () => void;
}

const formatDate = (dStr?: string) => {
  if (!dStr) return '—';
  try {
    const d = new Date(dStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dStr;
  }
};

export const PurchaseTable: React.FC<PurchaseTableProps> = ({
  bills = [],
  loading = false,
  onPay,
  onDelete,
  onAddNew,
}) => {
  const { t } = useTranslation('purchases');

  if (bills.length === 0 && !loading) {
    return (
      <EmptyState
        title={t('table.emptyTitle')}
        description={t('table.emptyDescription')}
        icon={<IconReceipt2 size={40} />}
        actionLabel={t('page.create')}
        onAction={onAddNew}
        py={48}
      />
    );
  }

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table striped highlightOnHover withTableBorder style={{ minWidth: 800 }}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            <Table.Th>{t('table.colInvoice')}</Table.Th>
            <Table.Th>{t('table.colVendor')}</Table.Th>
            <Table.Th>{t('table.colDueDate')}</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>{t('table.colTotal')}</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>{t('table.colRemaining')}</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>{t('table.colStatus')}</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 70 }}>{t('table.colActions')}</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bills.map((bill) => {
            const isOverdue = bill.status === 'OVERDUE';
            const isPaid = bill.status === 'PAID';
            const isPartial = bill.status === 'PARTIAL';
            const paidPct = paidPercent(bill.paidAmount, bill.totalAmount);

            return (
              <Table.Tr key={bill.id}>
                {/* Nomor Faktur & Tanggal */}
                <Table.Td>
                  <Group gap="xs" wrap="nowrap">
                    <ThemeIcon size={34} radius="md" color="blue" variant="light">
                      <IconReceipt2 size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text size="sm" fw={700} c="dark.9" ff="monospace">
                        {bill.billNumber}
                      </Text>
                      <Group gap={4} c="dimmed">
                        <IconCalendar size={12} />
                        <Text size="xs">{formatDate(bill.transactionDate)}</Text>
                      </Group>
                    </Box>
                  </Group>
                </Table.Td>

                {/* Vendor */}
                <Table.Td>
                  <Group gap={6} wrap="nowrap">
                    <IconUser size={14} color="var(--mantine-color-gray-6)" />
                    <Text size="sm" fw={600} c="dark.8">
                      {bill.vendorName}
                    </Text>
                  </Group>
                  <Text size="xs" c="dimmed">
                    {t('table.term', { term: bill.paymentTerm })}
                  </Text>
                </Table.Td>

                {/* Jatuh Tempo */}
                <Table.Td>
                  <Text size="sm" fw={600} c={isOverdue ? 'red.7' : 'dark.7'}>
                    {formatDate(bill.dueDate)}
                  </Text>
                  {isOverdue && (
                    <Text size="xs" c="red.7" fw={600}>
                      {t('table.pastDue')}
                    </Text>
                  )}
                </Table.Td>

                {/* Total Tagihan */}
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text
                    size="sm"
                    fw={700}
                    c="dark.9"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(bill.totalAmount)}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {t('table.tax', { amount: formatCurrency(bill.taxAmount) })}
                  </Text>
                </Table.Td>

                {/* Sisa Hutang & Progres */}
                <Table.Td style={{ textAlign: 'right' }}>
                  <Text
                    size="sm"
                    fw={700}
                    c={isPaid ? 'teal.8' : isOverdue ? 'red.7' : 'dark.8'}
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {formatCurrency(bill.remainingAmount)}
                  </Text>
                  <Group gap={4} justify="flex-end" mt={2}>
                    <Progress value={paidPct} size={4} w={60} radius="xl" color="teal.6" />
                    <Text size="xs" c="dimmed">
                      {paidPct}%
                    </Text>
                  </Group>
                </Table.Td>

                {/* Status Badge */}
                <Table.Td style={{ textAlign: 'center' }}>
                  <Badge
                    size="sm"
                    radius="sm"
                    variant={isPaid ? 'filled' : 'light'}
                    color={isPaid ? 'teal' : isOverdue ? 'red' : isPartial ? 'yellow' : 'orange'}
                  >
                    {isPaid
                      ? t('table.statusPaid')
                      : isOverdue
                        ? t('table.statusOverdue')
                        : isPartial
                          ? t('table.statusPartial')
                          : t('table.statusUnpaid')}
                  </Badge>
                </Table.Td>

                {/* Aksi Menu */}
                <Table.Td style={{ textAlign: 'center' }}>
                  <Menu position="bottom-end" shadow="md" width={180} withArrow>
                    <Menu.Target>
                      <ActionIcon variant="subtle" color="gray" radius="md">
                        <IconDots size={16} />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Label>{t('table.menuLabel')}</Menu.Label>

                      {!isPaid && (
                        <Menu.Item
                          leftSection={<IconCheck size={14} />}
                          color="teal"
                          onClick={() => onPay(bill)}
                        >
                          {t('table.menuPay')}
                        </Menu.Item>
                      )}

                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => onDelete(bill)}
                      >
                        {t('table.menuDelete')}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Table.Td>
              </Table.Tr>
            );
          })}
        </Table.Tbody>
      </Table>
    </Box>
  );
};
