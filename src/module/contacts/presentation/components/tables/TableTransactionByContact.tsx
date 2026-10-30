import React from 'react';
import { Box, Group, Pagination, Paper, Select, Table, Text } from '@mantine/core';
import { IconReceipt2 } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales';
import { TransactionTableRow } from './TransactionTableRow';
import { TransactionTableSkeleton } from './TransactionTableSkeleton';

type TableTransactionByContactProps = {
  transactions: Sale[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
};

const columns: Array<{ key: string; width: string; align?: 'center' | 'right' }> = [
  { key: 'number', width: '22%' },
  { key: 'dates', width: '18%' },
  { key: 'items', width: '24%' },
  { key: 'status', width: '12%', align: 'center' },
  { key: 'total', width: '12%', align: 'right' },
  { key: 'remaining', width: '12%', align: 'right' },
  { key: 'actions', width: '6%', align: 'center' },
];

export const TableTransactionByContact: React.FC<TableTransactionByContactProps> = ({
  transactions,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}) => {
  const { t, currentLanguage } = useTranslation('contactDetail');
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';
  const formatDateValue = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
          date
        );
  };
  const formatAmount = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) return <TransactionTableSkeleton limit={limit} />;

  const startRecord = transactions.length ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  return (
    <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {columns.map((column) => (
                <Table.Th key={column.key} ta={column.align} style={{ width: column.width }}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                    {t(`table.${column.key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {transactions.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <EmptyState
                    icon={<IconReceipt2 size={36} stroke={1.6} />}
                    title={t('table.emptyTitle')}
                    description={t('table.emptyDescription')}
                  />
                </Table.Td>
              </Table.Tr>
            )}
            {transactions.map((tx) => (
              <TransactionTableRow
                key={tx.id}
                transaction={tx}
                formatDateValue={formatDateValue}
                formatAmount={formatAmount}
              />
            ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Pagination Footer */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed">
              {t('table.pagination', { start: startRecord, end: endRecord, total })}
            </Text>
            <Select
              size="xs"
              w={75}
              value={String(limit)}
              onChange={(val) => onLimitChange(Number(val) || 10)}
              data={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' },
              ]}
              aria-label={t('table.pageSize')}
            />
          </Group>

          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
            color="primary"
          />
        </Group>
      </Box>
    </Paper>
  );
};

export default TableTransactionByContact;
