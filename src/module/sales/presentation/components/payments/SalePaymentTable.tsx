import {
  Group,
  Pagination,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowDown,
  IconArrowsSort,
  IconArrowUp,
  IconCashBanknoteOff,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import type {
  PaymentSortBy,
  SalePaymentRow,
  SortOrder,
} from '@/module/sales/domain/salePaymentList';

type SalePaymentTableProps = {
  rows: SalePaymentRow[];
  isLoading?: boolean;
  isError?: boolean;
  isFiltered: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  sortBy: PaymentSortBy;
  sortOrder: SortOrder;
  onSort: (by: PaymentSortBy) => void;
  /** Opens the invoice on its payment history, marking this payment. */
  onOpenPayment: (saleId: string, paymentId: string) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onRetry: () => void;
};

const PAGE_SIZES = ['10', '25', '50'];

type Column = { key: string; align?: 'right'; sort?: PaymentSortBy };

const COLUMNS: Column[] = [
  { key: 'colDate', sort: 'paymentDate' },
  { key: 'colNumber', sort: 'transactionNumber' },
  { key: 'colInvoice' },
  { key: 'colCustomer' },
  { key: 'colMethod' },
  { key: 'colAmount', align: 'right', sort: 'amount' },
  { key: 'colOverpayment', align: 'right', sort: 'overpaymentAmount' },
];

export function SalePaymentTable({
  rows,
  isLoading,
  isError,
  isFiltered,
  page,
  totalPages,
  total,
  limit,
  sortBy,
  sortOrder,
  onSort,
  onOpenPayment,
  onPageChange,
  onLimitChange,
  onRetry,
}: Readonly<SalePaymentTableProps>) {
  const { t } = useTranslation('sales');
  const emptyKey = isFiltered ? 'filteredEmpty' : 'empty';

  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={900}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {COLUMNS.map((column) => {
                const active = column.sort === sortBy;
                const SortIcon = active
                  ? sortOrder === 'asc'
                    ? IconArrowUp
                    : IconArrowDown
                  : IconArrowsSort;
                let ariaSort: 'ascending' | 'descending' | 'none' | undefined;
                if (column.sort) {
                  ariaSort = active ? (sortOrder === 'asc' ? 'ascending' : 'descending') : 'none';
                }
                return (
                  <Table.Th key={column.key} ta={column.align} aria-sort={ariaSort}>
                    {column.sort ? (
                      <UnstyledButton
                        onClick={() => onSort(column.sort as PaymentSortBy)}
                        aria-label={t('payments.sortBy', { column: t(`payments.${column.key}`) })}
                      >
                        <Group
                          gap={4}
                          wrap="nowrap"
                          justify={column.align ? 'flex-end' : undefined}
                        >
                          <Text
                            size="xs"
                            fw={700}
                            c={active ? 'primary.9' : 'dimmed'}
                            style={{ whiteSpace: 'nowrap' }}
                          >
                            {t(`payments.${column.key}`)}
                          </Text>
                          <SortIcon
                            size={14}
                            color={active ? undefined : 'var(--mantine-color-gray-5)'}
                          />
                        </Group>
                      </UnstyledButton>
                    ) : (
                      <Text size="xs" fw={700} c="dimmed" style={{ whiteSpace: 'nowrap' }}>
                        {t(`payments.${column.key}`)}
                      </Text>
                    )}
                  </Table.Th>
                );
              })}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading &&
              Array.from({ length: Math.min(limit, 5) }).map((_, index) => (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={`payment-skeleton-${index}`}>
                  {COLUMNS.map((column) => (
                    <Table.Td key={column.key}>
                      <Skeleton
                        height={14}
                        width={column.align ? 90 : 110}
                        ml={column.align && 'auto'}
                      />
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))}

            {!isLoading && isError && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconAlertCircle size={32} stroke={1.6} />}
                    title={t('payments.errorTitle')}
                    description={t('table.errorDescription')}
                    actionLabel={t('table.retry')}
                    onAction={onRetry}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading && !isError && rows.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={COLUMNS.length} p={0}>
                  <EmptyState
                    icon={<IconCashBanknoteOff size={32} stroke={1.6} />}
                    title={t(`payments.${emptyKey}Title`)}
                    description={t(`payments.${emptyKey}Description`)}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading &&
              !isError &&
              rows.map((row) => (
                <Table.Tr
                  key={row.id}
                  style={{ cursor: row.sale ? 'pointer' : undefined }}
                  onClick={() => row.sale && onOpenPayment(row.sale.id, row.id)}
                >
                  <Table.Td>
                    <Text size="sm">{formatDate(row.paymentDate)}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={700}>
                      {row.transactionNumber}
                    </Text>
                    {row.memo && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {row.memo}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm" fw={600} c="primary.9">
                      {row.sale?.transactionNumber ?? '—'}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{row.sale?.customerName ?? '—'}</Text>
                  </Table.Td>
                  <Table.Td>
                    <Text size="sm">{row.paymentMethodName ?? '—'}</Text>
                    {row.depositAccountName && (
                      <Text size="xs" c="dimmed">
                        {row.depositAccountName}
                      </Text>
                    )}
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" fw={700}>
                      {formatIDR(row.amount)}
                    </Text>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text size="sm" c={row.overpaymentAmount > 0 ? undefined : 'dimmed'}>
                      {row.overpaymentAmount > 0 ? formatIDR(row.overpaymentAmount) : '—'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          {t('payments.showing', { shown: rows.length, total })}
        </Text>
        <Group gap="sm">
          <Select
            size="xs"
            w={110}
            data={PAGE_SIZES.map((size) => ({
              value: size,
              label: t('table.perPage', { count: size }),
            }))}
            value={String(limit)}
            onChange={(value) => onLimitChange(Number(value) || 10)}
            aria-label={t('table.rowsPerPageAria')}
            allowDeselect={false}
          />
          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
            color="primary"
          />
        </Group>
      </Group>
    </Stack>
  );
}

export default SalePaymentTable;
