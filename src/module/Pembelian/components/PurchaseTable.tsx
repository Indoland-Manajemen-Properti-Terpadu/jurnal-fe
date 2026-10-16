import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Menu,
  Pagination,
  Progress,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconDots,
  IconReceipt2,
  IconTrash,
  IconUser,
} from '@tabler/icons-react';
import EmptyState from '@/components/EmptyState/EmptyState';
import { formatCurrency } from '@/utils/FormatCurrency';
import { PurchaseBill } from '../types/purchase';

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
  if (bills.length === 0 && !loading) {
    return (
      <EmptyState
        title="Belum Ada Faktur Pembelian"
        description="Catat tagihan dan faktur masuk dari pemasok/vendor untuk melacak hutang usaha bisnis Anda."
        icon={<IconReceipt2 size={40} />}
        actionLabel="Buat Tagihan Pembelian"
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
            <Table.Th>Nomor Faktur & Tanggal</Table.Th>
            <Table.Th>Vendor / Pemasok</Table.Th>
            <Table.Th>Jatuh Tempo</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Total Tagihan</Table.Th>
            <Table.Th style={{ textAlign: 'right' }}>Sisa Hutang</Table.Th>
            <Table.Th style={{ textAlign: 'center' }}>Status</Table.Th>
            <Table.Th style={{ textAlign: 'center', width: 70 }}>Aksi</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {bills.map((bill) => {
            const isOverdue = bill.status === 'OVERDUE';
            const isPaid = bill.status === 'PAID';
            const isPartial = bill.status === 'PARTIAL';
            const paidPct =
              bill.totalAmount > 0
                ? Math.min(100, Math.round((bill.paidAmount / bill.totalAmount) * 100))
                : 0;

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
                    Syarat: {bill.paymentTerm}
                  </Text>
                </Table.Td>

                {/* Jatuh Tempo */}
                <Table.Td>
                  <Text size="sm" fw={600} c={isOverdue ? 'red.7' : 'dark.7'}>
                    {formatDate(bill.dueDate)}
                  </Text>
                  {isOverdue && (
                    <Text size="xs" c="red.7" fw={600}>
                      Melewati Tempo
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
                    Pajak: {formatCurrency(bill.taxAmount)}
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
                      ? 'Lunas'
                      : isOverdue
                        ? 'Jatuh Tempo'
                        : isPartial
                          ? 'Sebagian'
                          : 'Belum Lunas'}
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
                      <Menu.Label>Opsi Faktur</Menu.Label>

                      {!isPaid && (
                        <Menu.Item
                          leftSection={<IconCheck size={14} />}
                          color="teal"
                          onClick={() => onPay(bill)}
                        >
                          Catat Pembayaran
                        </Menu.Item>
                      )}

                      <Menu.Item
                        leftSection={<IconTrash size={14} />}
                        color="red"
                        onClick={() => onDelete(bill)}
                      >
                        Hapus Faktur
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
